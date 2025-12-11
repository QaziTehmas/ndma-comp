import { jsPDF } from 'jspdf';

export const generateComprehensiveReport = async (floodData, weatherData = null, seismicData = null, airQuality = null) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentPage = 1;

    // Helper function to add page header/footer
    const addPageDecoration = () => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        doc.text('NDMA Alert System', 20, pageHeight - 10);
        currentPage++;
    };

    // ============= COVER PAGE =============
    let yPos = 40;

    // Try to add logo
    try {
        const logoImg = new Image();
        logoImg.src = '/techxonomy-logo.png';
        await new Promise((resolve) => {
            logoImg.onload = () => {
                doc.addImage(logoImg, 'PNG', pageWidth / 2 - 25, yPos, 50, 50);
                resolve();
            };
            logoImg.onerror = () => resolve();
            setTimeout(resolve, 1000);
        });
        yPos += 60;
    } catch (e) {
        yPos += 10;
    }

    // Title
    doc.setFillColor(30, 58, 138);
    doc.rect(15, yPos, pageWidth - 30, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('NDMA FLOOD & WEATHER', pageWidth / 2, yPos + 10, { align: 'center' });
    doc.text('ALERT REPORT', pageWidth / 2, yPos + 18, { align: 'center' });

    yPos += 35;
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const reportId = `NDMA-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`;
    doc.text(`Report ID: ${reportId}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;
    doc.text(`Generated: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;
    doc.text('Valid for: 1 hour from generation', pageWidth / 2, yPos, { align: 'center' });

    yPos += 20;
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, pageWidth - 40, 30, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('COMPREHENSIVE FLOOD MONITORING', pageWidth / 2, yPos + 8, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    doc.text('Real-time analysis of water levels, reservoir status,', pageWidth / 2, yPos + 15, { align: 'center' });
    doc.text('and flood risk assessment across Pakistan', pageWidth / 2, yPos + 21, { align: 'center' });

    yPos += 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    doc.text('Powered by Techxonomy AI Solutions', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('For emergencies: NDMA Helpline 1030 (Toll-Free)', pageWidth / 2, yPos, { align: 'center' });

    addPageDecoration();

    // ============= EXECUTIVE SUMMARY =============
    doc.addPage();
    yPos = 25;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('I. EXECUTIVE SUMMARY', 20, yPos);

    // Draw underline
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 100, yPos + 2);
    yPos += 15;

    // Overall Risk Box
    const overallRisk = floodData?.overall_risk || 'NORMAL';
    const riskColors = {
        'NORMAL': { fill: [16, 185, 129], text: [255, 255, 255] },
        'WARNING': { fill: [245, 158, 11], text: [255, 255, 255] },
        'DANGER': { fill: [239, 68, 68], text: [255, 255, 255] },
        'EXTREME': { fill: [153, 27, 27], text: [255, 255, 255] }
    };
    const riskStyle = riskColors[overallRisk] || { fill: [128, 128, 128], text: [255, 255, 255] };

    // Handle simplified color vs array
    if (Array.isArray(riskStyle.fill)) {
        doc.setFillColor(...riskStyle.fill);
        doc.setTextColor(...riskStyle.text);
    } else {
        // Re-map manual colors to safe arrays for spread
        if (overallRisk === 'NORMAL') doc.setFillColor(16, 185, 129);
        else if (overallRisk === 'WARNING') doc.setFillColor(245, 158, 11);
        else if (overallRisk === 'DANGER') doc.setFillColor(239, 68, 68);
        else doc.setFillColor(128, 128, 128);

        doc.setTextColor(255, 255, 255);
    }

    doc.roundedRect(20, yPos, pageWidth - 40, 18, 3, 3, 'F');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`OVERALL RISK LEVEL: ${overallRisk}`, pageWidth / 2, yPos + 11, { align: 'center' });
    yPos += 25;

    // Key Metrics Grid
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Monitoring Statistics:', 20, yPos);
    yPos += 8;

    const risks = floodData?.risks || {};
    const metrics = [
        { label: 'Dams Monitored', value: '2 (Tarbela, Mangla)' },
        { label: 'Barrages', value: `${Object.keys(risks.barrages || {}).length}` },
        { label: 'River Stations', value: `${Object.keys(risks.stations || {}).length}` },
        { label: 'Total RIM Inflow', value: `${(risks.rim_stations?.total_inflow || 0).toLocaleString()} cusecs` },
        { label: 'Data Source', value: floodData?.source || 'N/A' },
        { label: 'Report Date', value: floodData?.date || new Date().toLocaleDateString() }
    ];

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    metrics.forEach((metric, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const x = 20 + (col * 85);
        const y = yPos + (row * 12);

        doc.setFillColor(245, 247, 250);
        doc.roundedRect(x, y, 80, 10, 1, 1, 'F');
        doc.setTextColor(60);
        doc.text(`${metric.label}:`, x + 5, y + 6); // Removed icon
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(metric.value, x + 75, y + 6, { align: 'right' });
        doc.setFont('helvetica', 'normal');
    });
    yPos += 45;

    // Critical Insights
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Critical Insights:', 20, yPos); // Removed icon
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);

    const insights = [
        `Tarbela Dam operating at ${((risks.tarbela?.level || 0) / 1550 * 100).toFixed(1)}% of maximum conservation level`,
        `Mangla Dam operating at ${((risks.mangla?.level || 0) / 1242 * 100).toFixed(1)}% of maximum conservation level`,
        `Combined outflow from major dams: ${((risks.tarbela?.outflow || 0) + (risks.mangla?.outflow || 0)).toLocaleString()} cusecs`,
        `Highest barrage discharge: ${Math.max(...Object.values(risks.barrages || {}).map(b => b.inflow || 0)).toLocaleString()} cusecs`
    ];

    insights.forEach(insight => {
        doc.text(`- ${insight}`, 25, yPos);
        yPos += 6;
    });

    // Weather Section (New)
    // Weather Section (New)
    if (weatherData) {
        yPos += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        const locName = weatherData.locationName || 'Islamabad';
        doc.text(`Weather Forecast (${locName}):`, 20, yPos);
        yPos += 8;

        const hasAQI = !!airQuality;
        const boxHeight = hasAQI ? 55 : 35;

        doc.setFillColor(240, 249, 255);
        doc.roundedRect(20, yPos, pageWidth - 40, boxHeight, 2, 2, 'F');

        const current = weatherData.current || {};
        doc.setTextColor(0);
        doc.setFontSize(24);
        doc.text(`${current.temperature || '--'}°C`, 30, yPos + 15);

        doc.setFontSize(10);
        doc.text('Current Condition', 30, yPos + 22);

        // Grid of weather details
        doc.setFontSize(9);
        doc.text(`Wind: ${current.windSpeed || '--'} km/h`, 90, yPos + 10);
        doc.text(`Precipitation: ${current.precipitation || '0'} mm`, 90, yPos + 18);
        doc.text(`Humidity: ${current.humidity || '--'} %`, 90, yPos + 26);

        doc.text(`Time: ${current.time ? new Date(current.time).toLocaleTimeString() : '--'}`, 150, yPos + 10);
        doc.text(`Wind Direction: ${current.windDirection || '--'}°`, 150, yPos + 18);
        doc.text(`Elevation: ${weatherData.elevation || '--'} m`, 150, yPos + 26);

        // Air Quality
        if (hasAQI) {
            const aqiValue = airQuality.aqi || '--';
            const aqiLabel = airQuality.category?.level || 'Unknown';

            // Dynamic color based on value (matching service logic roughly)
            let aqiColor = [16, 185, 129]; // Green
            if (aqiValue > 50) aqiColor = [255, 235, 59]; // Yellow (approx)
            if (aqiValue > 100) aqiColor = [249, 115, 22]; // Orange
            if (aqiValue > 150) aqiColor = [239, 68, 68]; // Red
            if (aqiValue > 200) aqiColor = [168, 85, 247]; // Purple
            if (aqiValue > 300) aqiColor = [127, 29, 29]; // Maroon

            // Print AQI below grid
            const aqiY = yPos + 38;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 64, 175);
            doc.text('Air Quality Context:', 30, aqiY);

            // AQI Badge
            doc.setFillColor(...aqiColor);
            // Make box wider using text width approximation
            const boxWidth = doc.getTextWidth(`AQI: ${aqiValue} (${aqiLabel})`) + 10;
            doc.roundedRect(80, aqiY - 4, boxWidth, 6, 2, 2, 'F');

            // Text inside badge
            if (aqiValue > 100) doc.setTextColor(255, 255, 255); // White text for dark backgrounds
            else doc.setTextColor(0); // Black text for light backgrounds (yellow/green)

            doc.text(`AQI: ${aqiValue} (${aqiLabel})`, 85, aqiY);

            // Pollutants
            doc.setTextColor(60);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.text(`(PM2.5: ${Math.round(airQuality.pm25) || '--'} | PM10: ${Math.round(airQuality.pm10) || '--'})`, 85 + boxWidth + 5, aqiY);
        }

        yPos += boxHeight + 10;
    }

    // Seismic Activity Section (New)
    if (seismicData) {
        // Check if we need new page
        if (yPos > pageHeight - 60) {
            doc.addPage();
            addPageDecoration();
            yPos = 25;
        }

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(185, 28, 28); // Red-700
        doc.text('Seismic Activity Report:', 20, yPos);
        yPos += 8;

        doc.setFillColor(254, 242, 242); // Red-50
        doc.roundedRect(20, yPos, pageWidth - 40, 25, 2, 2, 'F');

        const summary = seismicData.summary || seismicData;
        const totalQuakes = summary.total || 0;

        doc.setTextColor(0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');

        doc.text(`Recent Earthquakes (Last 24h):`, 25, yPos + 8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${totalQuakes}`, 70, yPos + 8);

        const maxMag = summary.maxMagnitude || 0;
        doc.setFont('helvetica', 'normal');
        doc.text(`Max Magnitude:`, 90, yPos + 8);
        doc.setFont('helvetica', 'bold');
        if (maxMag > 5) doc.setTextColor(220, 38, 38); // Red
        else doc.setTextColor(0);
        doc.text(`${maxMag} Richter`, 120, yPos + 8);

        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nearest Significant Event:`, 25, yPos + 16);
        doc.text(`${summary.closest?.place || 'None reported'}`, 70, yPos + 16);
    }

    addPageDecoration();

    // ============= WATER LEVELS ANALYSIS =============
    doc.addPage();
    yPos = 25;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('II. WATER LEVELS ANALYSIS', 20, yPos);
    doc.setDrawColor(30, 58, 138);
    doc.line(20, yPos + 2, 120, yPos + 2);
    yPos += 15;

    // === MAJOR DAMS ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('A. Major Reservoirs', 20, yPos);
    yPos += 10;

    const tarbela = risks.tarbela || {};
    const mangla = risks.mangla || {};
    const dams = [
        { name: 'Tarbela Dam', data: tarbela, maxLevel: 1550 },
        { name: 'Mangla Dam', data: mangla, maxLevel: 1242 }
    ];

    dams.forEach((dam) => {
        // Dam header box
        doc.setFillColor(240, 248, 255);
        doc.rect(20, yPos, pageWidth - 40, 8, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 64, 175);
        doc.text(`${dam.name}`, 22, yPos + 5); // Removed icon

        // Status badge
        if (dam.data.risk === 'NORMAL') doc.setFillColor(16, 185, 129);
        else if (dam.data.risk === 'WARNING') doc.setFillColor(245, 158, 11);
        else doc.setFillColor(239, 68, 68);

        doc.roundedRect(pageWidth - 50, yPos + 1, 28, 6, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(dam.data.risk || 'NORMAL', pageWidth - 36, yPos + 5, { align: 'center' });
        yPos += 12;

        // Dam details
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);

        const level = dam.data.level || 0;
        const percentage = ((level / dam.maxLevel) * 100).toFixed(1);

        doc.text(`Water Level:`, 25, yPos);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`${level.toFixed(2)} ft (${percentage}% of max)`, 55, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        doc.text(`Inflow:`, 25, yPos);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`${(dam.data.inflow || 0).toLocaleString()} cusecs`, 55, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        doc.text(`Outflow:`, 25, yPos);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text(`${(dam.data.outflow || 0).toLocaleString()} cusecs`, 55, yPos);
        yPos += 5;

        const netFlow = (dam.data.inflow || 0) - (dam.data.outflow || 0);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        doc.text(`Net Flow:`, 25, yPos);
        doc.setFont('helvetica', 'bold');

        if (netFlow >= 0) doc.setTextColor(16, 185, 129);
        else doc.setTextColor(239, 68, 68);

        doc.text(`${netFlow > 0 ? '+' : ''}${netFlow.toLocaleString()} cusecs ${netFlow >= 0 ? '(rising)' : '(falling)'}`, 55, yPos);
        yPos += 10;
    });

    yPos += 5;

    // === BARRAGES ===
    if (yPos > 200) {
        doc.addPage();
        addPageDecoration();
        yPos = 25;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('B. Barrages', 20, yPos);
    yPos += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(230, 230, 230);
    doc.rect(20, yPos, pageWidth - 40, 6, 'F');
    doc.setTextColor(0);
    doc.text('Name', 22, yPos + 4);
    doc.text('U/S', 65, yPos + 4, { align: 'center' });
    doc.text('D/S', 95, yPos + 4, { align: 'center' });
    doc.text('Delta', 125, yPos + 4, { align: 'center' });
    doc.text('Status', 155, yPos + 4, { align: 'center' });
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    Object.entries(risks.barrages || {}).forEach(([name, data], idx) => {
        if (yPos > 270) {
            doc.addPage();
            addPageDecoration();
            yPos = 25;
        }

        const inflow = data.inflow || 0;
        const outflow = data.outflow || 0;
        const delta = inflow - outflow;

        if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(20, yPos - 3, pageWidth - 40, 6, 'F');
        }

        doc.setTextColor(0);
        doc.text(name.charAt(0).toUpperCase() + name.slice(1), 22, yPos);
        doc.text(inflow.toLocaleString(), 65, yPos, { align: 'center' });
        doc.text(outflow.toLocaleString(), 95, yPos, { align: 'center' });

        if (delta >= 0) doc.setTextColor(16, 185, 129);
        else doc.setTextColor(239, 68, 68);

        doc.text((delta > 0 ? '+' : '') + delta.toLocaleString(), 125, yPos, { align: 'center' });
        doc.setTextColor(60);
        doc.text(data.risk || 'N/A', 155, yPos, { align: 'center' });

        yPos += 6;
    });

    yPos += 10;

    // === RIVER STATIONS ===
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('C. River Monitoring Stations', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    Object.entries(risks.stations || {}).forEach(([name, data]) => {
        doc.setFillColor(240, 248, 255);
        doc.rect(20, yPos, pageWidth - 40, 7, 'F');
        doc.setTextColor(0);
        doc.text(`- ${name.charAt(0).toUpperCase() + name.slice(1)}:`, 22, yPos + 5); // Removed icon
        doc.setFont('helvetica', 'bold');
        doc.text(`${(data.inflow || 0).toLocaleString()} cusecs`, 80, yPos + 5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60);
        doc.text(`(${data.risk || 'N/A'})`, 120, yPos + 5);
        yPos += 9;
    });

    addPageDecoration();

    // ============= RECOMMENDATIONS =============
    doc.addPage();
    yPos = 25;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('III. RECOMMENDATIONS & ACTIONS', 20, yPos);
    doc.line(20, yPos + 2, 130, yPos + 2);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Immediate Actions Required:', 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const recommendations = [
        'Continue 24/7 monitoring of all water measurement points',
        'Maintain real-time communication with provincial disaster management authorities',
        'Update river flow forecasts every hour during monsoon season',
        'Pre-position emergency response supplies in identified high-risk districts',
        'Conduct daily briefings with relevant stakeholders during elevated risk periods',
        'Ensure flood warning dissemination systems are operational'
    ];

    recommendations.forEach((rec, idx) => {
        doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        doc.rect(20, yPos - 2, pageWidth - 40, 7, 'F');
        doc.setTextColor(0);
        doc.text(`${idx + 1}. ${rec}`, 22, yPos + 3);
        yPos += 8;
    });

    yPos += 10;

    // Emergency Contacts
    doc.setFillColor(254, 202, 202);
    doc.rect(20, yPos, pageWidth - 40, 35, 'F');
    yPos += 6;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(153, 27, 27);
    doc.text('EMERGENCY CONTACTS', pageWidth / 2, yPos, { align: 'center' }); // Removed icon
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const contacts = [
        'NDMA Helpline: 1030 (Toll-Free)',
        'Email: info@ndma.gov.pk',
        'Emergency Services: 1122',
        'Flood Information: +92-51-9205286'
    ];

    contacts.forEach(contact => {
        doc.text(contact, pageWidth / 2, yPos, { align: 'center' });
        yPos += 6;
    });

    yPos += 15;

    // Glossary
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Glossary of Terms:', 20, yPos);
    yPos += 7;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60);
    const glossary = [
        'Cusecs: Cubic feet per second (unit of water flow measurement)',
        'U/S Discharge: Upstream discharge (water flowing into the barrage)',
        'D/S Discharge: Downstream discharge (water released from the barrage)',
        'RIM Stations: River Indus Monitoring stations tracking tributary inflows',
        'IRSA: Indus River System Authority (official water data source)'
    ];

    glossary.forEach(term => {
        doc.text(`- ${term}`, 22, yPos);
        yPos += 5;
    });

    yPos += 10;

    // Disclaimer
    doc.setFillColor(250, 250, 250);
    doc.rect(20, yPos, pageWidth - 40, 25, 'F');
    yPos += 5;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    const disclaimer = 'DISCLAIMER: This report is generated automatically from real-time data sources including IRSA official reports and meteorological services. While every effort is made to ensure accuracy and timeliness, users are advised to verify critical information through official channels before making operational decisions. Techxonomy AI Solutions and NDMA are not liable for decisions made based solely on this automated report. This system is designed to supplement, not replace, professional judgment and official communications.';
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 50);
    doc.text(disclaimerLines, pageWidth / 2, yPos, { align: 'center' });

    addPageDecoration();

    console.log('Professional PDF generated successfully with', currentPage, 'pages!');
    return doc;
};
