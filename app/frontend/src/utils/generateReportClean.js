import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function safeText(doc, text, x, y, maxWidth) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth || 500);
  doc.text(lines, x, y);
  return lines.length * 12;
}

function writeLabelValue(doc, label, value, x, y, maxWidth = 500) {
  const lab = String(label || "");
  const val = String(value ?? "");
  doc.setFont("helvetica", "bold");
  doc.text(lab, x, y);
  const lw = doc.getTextWidth(lab) + 6;
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(val, Math.max(20, maxWidth - lw));
  doc.text(lines, x + lw, y);
  return lines.length * 12;
}

function writeTwo(
  doc,
  left,
  right,
  xLeft,
  xRight,
  y,
  maxWidthLeft = 240,
  maxWidthRight = 240
) {
  const splitLabel = (s) => {
    const str = String(s || "");
    const idx = str.indexOf(":");
    if (idx === -1) return { label: "", value: str };
    return { label: str.slice(0, idx + 1), value: str.slice(idx + 1).trim() };
  };

  const L = splitLabel(left);
  const R = splitLabel(right);
  const leftLines = doc.splitTextToSize(L.value || "", maxWidthLeft);
  const rightLines = doc.splitTextToSize(R.value || "", maxWidthRight);
  const lines = Math.max(leftLines.length, rightLines.length) || 1;

  const draw = (X, itemLines, label) => {
    if (label) {
      doc.setFont("helvetica", "bold");
      doc.text(label, X, y);
      const lw = doc.getTextWidth(label) + 4;
      doc.setFont("helvetica", "normal");
      doc.text(itemLines, X + lw, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(itemLines, X, y);
    }
  };

  draw(xLeft, leftLines, L.label);
  draw(xRight, rightLines, R.label);
  doc.setFont("helvetica", "normal");
  return lines * 12;
}

function writeThree(
  doc,
  a,
  b,
  c,
  xA,
  xB,
  xC,
  y,
  maxA = 160,
  maxB = 160,
  maxC = 160
) {
  // For each column, split into label:value if possible and render label bold, value normal
  const splitLabel = (str) => {
    const s = String(str || "");
    const idx = s.indexOf(":");
    if (idx === -1) return { label: "", value: s };
    return { label: s.slice(0, idx + 1), value: s.slice(idx + 1).trim() };
  };

  const A = splitLabel(a);
  const B = splitLabel(b);
  const C = splitLabel(c);

  const aLines = doc.splitTextToSize(A.value || "", maxA);
  const bLines = doc.splitTextToSize(B.value || "", maxB);
  const cLines = doc.splitTextToSize(C.value || "", maxC);
  const lines = Math.max(aLines.length, bLines.length, cLines.length) || 1;

  const drawCol = (X, itemLines, label) => {
    if (label) {
      doc.setFont("helvetica", "bold");
      doc.text(label, X, y);
      const labelW = doc.getTextWidth(label) + 4;
      doc.setFont("helvetica", "normal");
      doc.text(itemLines, X + labelW, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(itemLines, X, y);
    }
  };

  drawCol(xA, aLines, A.label);
  drawCol(xB, bLines, B.label);
  drawCol(xC, cLines, C.label);
  doc.setFont("helvetica", "normal");
  return lines * 12;
}

function writeInlineBold(doc, textLine, x, y, maxWidth = 520) {
  // segments separated by '  |  '
  const segments = String(textLine || "").split("  |  ");
  let cx = x;
  segments.forEach((seg, idx) => {
    const s = seg.trim();
    const colon = s.indexOf(":");
    if (colon !== -1) {
      const label = s.slice(0, colon + 1);
      const value = s.slice(colon + 1).trim();
      doc.setFont("helvetica", "bold");
      doc.text(label, cx, y);
      const lw = doc.getTextWidth(label) + 4;
      doc.setFont("helvetica", "normal");
      doc.text(value, cx + lw, y);
      cx += lw + doc.getTextWidth(value) + 12;
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(s, cx, y, { maxWidth: maxWidth - (cx - x) });
      cx += doc.getTextWidth(s) + 12;
    }
    // draw separator
    if (idx < segments.length - 1) {
      doc.setFont("helvetica", "normal");
      doc.text("|", cx - 6, y);
    }
  });
  doc.setFont("helvetica", "normal");
}
async function captureElementImage(selector, scale = 1.25) {
  const el = document.querySelector(selector);
  if (!el) return null;
  try {
    const canvas = await html2canvas(el, { scale });
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("captureElementImage failed", selector, e);
    return null;
  }
}

async function generatePdfReport({
  selectedPoint,
  locationName,
  mapView,
  prediction,
  weatherData,
  nearestQuake,
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  const pageH = doc.internal.pageSize.height;
  let y = 40;
  let h = 0;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Flood Analysis Report", margin, y);
  y += 28;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const locLabelHeight = writeLabelValue(
    doc,
    "Location:",
    locationName || selectedPoint?.name || "(unnamed)",
    margin,
    y,
    500
  );
  y += locLabelHeight + 4;

  const lat = selectedPoint?.latitude ?? "N/A";
  const lon = selectedPoint?.longitude ?? "N/A";
  const coordHeight = writeLabelValue(
    doc,
    "Coordinates:",
    `${lat}, ${lon}`,
    margin,
    y,
    500
  );
  y += coordHeight + 8;

  // Map screenshot (prefer ArcGIS screenshot)
  let added = false;
  try {
    if (mapView && typeof mapView.takeScreenshot === "function") {
      const ss = await mapView.takeScreenshot({ width: 1200, height: 700 });
      const dataUrl = ss?.dataUrl || ss?.data || ss || null;
      if (dataUrl) {
        // use a smaller map snapshot to save vertical space
        doc.addImage(dataUrl, "JPEG", margin, y, 420, 220);
        y += 230;
        added = true;
      }
    }
  } catch (e) {
    console.warn("mapView.takeScreenshot failed", e);
  }

  if (!added) {
    const img = await captureElementImage(".map-section", 1.25);
    if (img) {
      doc.addImage(img, "JPEG", margin, y, 420, 220);
      y += 230;
    }
  }

  // Charts capture (if present)
  const chartsImg = await captureElementImage(".charts-section", 1.25);
  if (chartsImg) {
    if (y + 240 > pageH) {
      doc.addPage();
      y = 40;
    }
    doc.addImage(chartsImg, "PNG", margin, y, 500, 220);
    // add a little extra gap after charts so the Prediction header is separated
    y += 250;
  }

  // Prediction summary (expanded)
  if (prediction) {
    if (y + 140 > pageH) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Prediction Summary", margin, y);
    y += 18;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // compact prediction into a single-line summary (risk level | score | short message)
    if (y + 28 > pageH) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(10);
    const parts = [];
    parts.push(`Risk: ${prediction.risk_level ?? "N/A"}`);
    if (prediction.risk_score != null)
      parts.push(`Score: ${prediction.risk_score}`);
    if (prediction.message) parts.push(String(prediction.message));
    const predLine = parts.join("  |  ");
    writeInlineBold(doc, predLine, margin, y, 520);
    y += 16;

    // If the prediction contains additional metadata, include it
    const meta = { ...prediction };
    delete meta.risk_level;
    delete meta.risk_score;
    delete meta.message;
    if (Object.keys(meta).length) {
      safeText(doc, "Additional prediction details:", margin, y, 500);
      y += 14;
      Object.entries(meta).forEach(([k, v]) => {
        safeText(doc, `- ${k}: ${JSON.stringify(v)}`, margin + 8, y, 480);
        y += 12;
      });
      y += 8;
    }
  }

  // Weather snapshot (fuller)
  if (weatherData) {
    if (y + 180 > pageH) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Weather Snapshot", margin, y);
    y += 18;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const cw = weatherData.current_weather || {};
    // compress weather into two lines: (Temp | Wind) and (Wind dir / Ref time | Precip & Rain)
    if (y + 30 > pageH) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(10);
    // Line 1: Temp | Wind | Wind dir
    const tempText = `Temp: ${cw.temperature ?? "N/A"} °C`;
    const windText = `Wind: ${cw.windspeed ?? cw.wind_speed ?? "N/A"} m/s`;
    const windDirText =
      cw.winddirection != null ? `Dir: ${cw.winddirection}°` : `Dir: -`;
    h = writeThree(
      doc,
      tempText,
      windText,
      windDirText,
      margin,
      margin + 170,
      margin + 340,
      y,
      160,
      160,
      160
    );
    y += h + 6;

    // Align precipitation/rain with current time using hourly arrays
    const hourly = weatherData.hourly || {};
    let precip = null;
    let rain = null;
    const curIso = cw.time;
    if (hourly.time && Array.isArray(hourly.time)) {
      let idx = -1;
      if (curIso) idx = hourly.time.indexOf(curIso);
      if (idx === -1) {
        const now = Date.now();
        let best = 0,
          bestDiff = Infinity;
        hourly.time.forEach((t, i) => {
          const d = Math.abs(new Date(t).getTime() - now);
          if (d < bestDiff) {
            best = i;
            bestDiff = d;
          }
        });
        idx = best;
      }
      if (idx >= 0) {
        precip = hourly.precipitation
          ? hourly.precipitation[idx] ?? null
          : null;
        rain = hourly.rain ? hourly.rain[idx] ?? null : null;
      }
    }

    // Line 2: Ref time | Precip | Rain
    const refTimeText = `Ref: ${cw.time ?? "-"}`;
    const precipText = `Precip: ${precip != null ? `${precip} mm` : "N/A"}`;
    const rainText = `Rain: ${rain != null ? `${rain} mm` : "N/A"}`;
    h = writeThree(
      doc,
      refTimeText,
      precipText,
      rainText,
      margin,
      margin + 170,
      margin + 340,
      y,
      160,
      160,
      160
    );
    y += h + 6;

    // Optionally include a small hourly table around current index for context
    if (hourly.time && Array.isArray(hourly.time)) {
      const idx = (() => {
        if (!cw.time) return -1;
        return hourly.time.indexOf(cw.time);
      })();
      if (idx >= 0) {
        const start = Math.max(0, idx - 2);
        const end = Math.min(hourly.time.length - 1, idx + 2);
        safeText(doc, "Nearby hourly values:", margin, y, 500);
        y += 14;
        for (let i = start; i <= end; i++) {
          const t = hourly.time[i];
          const p = hourly.precipitation ? hourly.precipitation[i] ?? "-" : "-";
          const r = hourly.rain ? hourly.rain[i] ?? "-" : "-";
          // show time and precip on left, rain on right to save space
          const left = `${t} — precip: ${p} mm`;
          const right = `rain: ${r} mm`;
          const hh = writeTwo(
            doc,
            left,
            right,
            margin + 8,
            margin + 260,
            y,
            220,
            200
          );
          y += hh;
        }
        y += 8;
      }
    }
  }

  // Nearest earthquake (expanded)
  if (nearestQuake) {
    if (y + 160 > pageH) {
      doc.addPage();
      y = 40;
    }
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Nearest Earthquake", margin, y);
    y += 18;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const nq = nearestQuake;
    // Write magnitude and distance on same line
    if (y + 20 > pageH) {
      doc.addPage();
      y = 40;
    }
    h = writeTwo(
      doc,
      `Magnitude: ${nq.magnitude ?? "N/A"}`,
      `Distance: ${nq.distance ?? "N/A"} km`,
      margin,
      margin + 260,
      y
    );
    y += h + 6;
    if (nq.depth != null || nq.time) {
      const left = nq.depth != null ? `Depth: ${nq.depth} km` : "";
      const right = nq.time
        ? `Time: ${(nq.time instanceof Date
            ? nq.time
            : new Date(nq.time)
          ).toLocaleString()}`
        : "";
      h = writeTwo(doc, left, right, margin, margin + 260, y);
      y += h + 6;
    }
    if (nq.place) {
      const placeLines = doc.splitTextToSize(nq.place, 500);
      doc.text(placeLines, margin, y);
      y += placeLines.length * 12 + 6;
    }
    if (nq.url) {
      const urlLines = doc.splitTextToSize(nq.url, 500);
      doc.text(urlLines, margin, y);
      y += urlLines.length * 12 + 6;
    }
  }

  // Footer and save
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const footer = `Generated by Floods Insights — ${new Date().toLocaleString()}`;
  doc.text(footer, margin, pageH - 30);
  doc.save(`Flood-Report-${Date.now()}.pdf`);
}

export default generatePdfReport;
