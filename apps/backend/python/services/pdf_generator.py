from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm, inch
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from datetime import datetime
import io
import os

class PDFReportGenerator:
    def __init__(self):
        self.width, self.height = A4
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Create custom paragraph styles"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceBefore=12,
            spaceAfter=6,
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskNormal',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#10b981'),
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskWarning',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#f59e0b'),
            fontName='Helvetica-Bold'
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskDanger',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#ef4444'),
            fontName='Helvetica-Bold'
        ))

    def _add_header_footer(self, canvas, doc):
        """Add header and footer to each page"""
        canvas.saveState()
        
        # Header
        if os.path.exists('techxonomy-logo.png'):
            canvas.drawImage('techxonomy-logo.png', self.width - 80*mm, self.height - 25*mm, 
                           width=15*mm, height=15*mm, preserveAspectRatio=True, mask='auto')
        
        # Footer with page number
        canvas.setFont('Helvetica', 8)
        canvas.setFillColor(colors.grey)
        page_num = canvas.getPageNumber()
        text = f"Page {page_num} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        canvas.drawRightString(self.width - 20*mm, 15*mm, text)
        
        canvas.restoreState()

    def _get_risk_color(self, risk):
        """Get color based on risk level"""
        risk_colors = {
            'NORMAL': colors.HexColor('#10b981'),
            'WARNING': colors.HexColor('#f59e0b'),
            'DANGER': colors.HexColor('#ef4444'),
            'EXTREME': colors.HexColor('#991b1b')
        }
        return risk_colors.get(risk, colors.grey)

    def _create_cover_page(self, report_id):
        """Create report cover page"""
        elements = []
        
        # Logo
        if os.path.exists('techxonomy-logo.png'):
            logo = Image('techxonomy-logo.png', width=60*mm, height=60*mm)
            logo.hAlign = 'CENTER'
            elements.append(logo)
            elements.append(Spacer(1, 20*mm))
        
        # Title
        title = Paragraph("NDMA Flood & Weather<br/>Alert Report", self.styles['CustomTitle'])
        elements.append(title)
        elements.append(Spacer(1, 10*mm))
        
        # Report ID and metadata
        metadata = f"""
        <para align=center fontSize=12>
        <b>Report ID:</b> {report_id}<br/>
        <b>Generated:</b> {datetime.now().strftime('%d %B %Y, %H:%M:%S')}<br/>
        <b>Valid for:</b> 1 hour from generation<br/>
        <b>Powered by:</b> Techxonomy AI Solutions
        </para>
        """
        elements.append(Paragraph(metadata, self.styles['Normal']))
        elements.append(Spacer(1, 20*mm))
        
        # Disclaimer box
        disclaimer = """
        <para align=center fontSize=9 textColor=#666666>
        <i>This is an automated report generated from real-time data sources.<br/>
        For emergency situations, please contact NDMA at 1030 (toll-free)</i>
        </para>
        """
        elements.append(Paragraph(disclaimer, self.styles['Normal']))
        elements.append(PageBreak())
        
        return elements

    def _create_executive_summary(self, flood_data):
        """Create executive summary page"""
        elements = []
        risks = flood_data.get('risks', {})
        
        # Section title
        elements.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
        elements.append(Spacer(1, 5*mm))
        
        # Overall risk indicator
        overall_risk = flood_data.get('overall_risk', 'NORMAL')
        risk_color = self._get_risk_color(overall_risk)
        
        risk_table = Table([[f"OVERALL RISK: {overall_risk}"]], colWidths=[150*mm])
        risk_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), risk_color),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 16),
            ('PADDING', (0, 0), (-1, -1), 10),
        ]))
        elements.append(risk_table)
        elements.append(Spacer(1, 5*mm))
        
        # Key statistics
        stats_data = [
            ['Metric', 'Value'],
            ['Major Dams Monitored', '2 (Tarbela, Mangla)'],
            ['Barrages Monitored', f"{len(risks.get('barrages', {}))}"],
            ['River Stations', f"{len(risks.get('stations', {}))}"],
            ['Total RIM Inflow', f"{risks.get('rim_stations', {}).get('total_inflow', 0):,} cusecs"],
            ['Data Source', flood_data.get('source', 'N/A')],
            ['Report Date', flood_data.get('date', 'N/A')]
        ]
        
        stats_table = Table(stats_data, colWidths=[80*mm, 70*mm])
        stats_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        elements.append(stats_table)
        elements.append(PageBreak())
        
        return elements

    def _create_water_levels_section(self, flood_data):
        """Create water levels analysis pages"""
        elements = []
        risks = flood_data.get('risks', {})
        
        # DAMS SECTION
        elements.append(Paragraph("Major Reservoirs", self.styles['SectionHeader']))
        elements.append(Spacer(1, 3*mm))
        
        dam_data = [
            ['Dam', 'Level (ft)', 'Inflow (Cs)', 'Outflow (Cs)', 'Status']
        ]
        
        # Tarbela
        tarbela = risks.get('tarbela', {})
        dam_data.append([
            'Tarbela',
            f"{tarbela.get('level', 0):.2f}",
            f"{tarbela.get('inflow', 0):,}",
            f"{tarbela.get('outflow', 0):,}",
            tarbela.get('risk', 'N/A')
        ])
        
        # Mangla
        mangla = risks.get('mangla', {})
        dam_data.append([
            'Mangla',
            f"{mangla.get('level', 0):.2f}",
            f"{mangla.get('inflow', 0):,}",
            f"{mangla.get('outflow', 0):,}",
            mangla.get('risk', 'N/A')
        ])
        
        dam_table = Table(dam_data, colWidths=[35*mm, 30*mm, 30*mm, 30*mm, 25*mm])
        dam_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        elements.append(dam_table)
        elements.append(Spacer(1, 8*mm))
        
        # BARRAGES SECTION
        elements.append(Paragraph("Barrages", self.styles['SectionHeader']))
        elements.append(Spacer(1, 3*mm))
        
        barrage_data = [
            ['Barrage', 'U/S Discharge (Cs)', 'D/S Discharge (Cs)', 'Delta', 'Status']
        ]
        
        barrages = risks.get('barrages', {})
        for name, data in barrages.items():
            inflow = data.get('inflow', 0)
            outflow = data.get('outflow', 0)
            delta = inflow - outflow
            barrage_data.append([
                name.capitalize(),
                f"{inflow:,}",
                f"{outflow:,}",
                f"{delta:+,}",
                data.get('risk', 'N/A')
            ])
        
        barrage_table = Table(barrage_data, colWidths=[30*mm, 35*mm, 35*mm, 25*mm, 25*mm])
        barrage_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        elements.append(barrage_table)
        elements.append(Spacer(1, 8*mm))
        
        # RIVER STATIONS
        elements.append(Paragraph("River Monitoring Stations", self.styles['SectionHeader']))
        elements.append(Spacer(1, 3*mm))
        
        station_data = [
            ['Station', 'Discharge (Cs)', 'Status']
        ]
        
        stations = risks.get('stations', {})
        for name, data in stations.items():
            station_data.append([
                name.capitalize(),
                f"{data.get('inflow', 0):,}",
                data.get('risk', 'N/A')
            ])
        
        station_table = Table(station_data, colWidths=[50*mm, 50*mm, 50*mm])
        station_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f3f4f6')])
        ]))
        elements.append(station_table)
        elements.append(PageBreak())
        
        return elements

    def _create_recommendations(self, flood_data):
        """Generate AI-based recommendations"""
        elements = []
        risks = flood_data.get('risks', {})
        
        elements.append(Paragraph("AI-Generated Recommendations", self.styles['SectionHeader']))
        elements.append(Spacer(1, 3*mm))
        
        recommendations = []
        
        # Check dam levels
        tarbela = risks.get('tarbela', {})
        if tarbela.get('risk') in ['WARNING', 'DANGER', 'EXTREME']:
            recommendations.append(f"• <b>ALERT:</b> Tarbela Dam at {tarbela.get('risk')} status. Monitor closely and prepare downstream evacuation plans.")
        
        mangla = risks.get('mangla', {})
        if mangla.get('risk') in ['WARNING', 'DANGER', 'EXTREME']:
            recommendations.append(f"• <b>ALERT:</b> Mangla Dam at {mangla.get('risk')} status. Alert local authorities in Jhelum region.")
        
        # Check high inflows
        rim_total = risks.get('rim_stations', {}).get('total_inflow', 0)
        if rim_total > 50000:
            recommendations.append(f"• High RIM inflow detected ({rim_total:,} cusecs). Review flood protection measures in northern areas.")
        
        # Barrage monitoring
        barrages = risks.get('barrages', {})
        for name, data in barrages.items():
            if data.get('risk') in ['WARNING', 'DANGER']:
                recommendations.append(f"• Monitor {name.capitalize()} Barrage - elevated risk level detected.")
        
        # General recommendations
        recommendations.append("• Continue 24/7 monitoring of all water points.")
        recommendations.append("• Maintain communication with provincial disaster management authorities.")
        recommendations.append("• Update forecasts every hour during monsoon season.")
        recommendations.append("• Pre-position emergency supplies in high-risk districts.")
        
        if not recommendations:
            recommendations.append("• All systems normal. Continue routine monitoring.")
        
        for rec in recommendations:
            elements.append(Paragraph(rec, self.styles['Normal']))
            elements.append(Spacer(1, 2*mm))
        
        elements.append(PageBreak())
        return elements

    def _create_appendix(self):
        """Create appendix with glossary and contacts"""
        elements = []
        
        elements.append(Paragraph("Appendix: Glossary & Emergency Contacts", self.styles['SectionHeader']))
        elements.append(Spacer(1, 3*mm))
        
        glossary = """
        <b>Glossary of Terms:</b><br/>
        • <b>Cusecs:</b> Cubic feet per second (flow measurement)<br/>
        • <b>U/S Discharge:</b> Upstream discharge (inflow)<br/>
        • <b>D/S Discharge:</b> Downstream discharge (outflow)<br/>
        • <b>RIM Stations:</b> River Indus Monitoring stations<br/>
        • <b>IRSA:</b> Indus River System Authority<br/><br/>
        
        <b>Risk Level Definitions:</b><br/>
        • <b>NORMAL:</b> Within safe operating parameters<br/>
        • <b>WARNING:</b> Approaching threshold, increased monitoring required<br/>
        • <b>DANGER:</b> Exceeds safe levels, immediate action needed<br/>
        • <b>EXTREME:</b> Critical situation, evacuation may be necessary<br/><br/>
        
        <b>Emergency Contacts:</b><br/>
        • NDMA Helpline: 1030 (Toll-Free)<br/>
        • NDMA Email: info@ndma.gov.pk<br/>
        • Emergency Services: 1122<br/>
        • Flood Information: +92-51-9205286<br/><br/>
        
        <b>Disclaimer:</b><br/>
        <i>This report is generated automatically from real-time data sources including IRSA and 
        weather APIs. While every effort is made to ensure accuracy, users should verify critical 
        information through official channels. Techxonomy AI Solutions is not liable for decisions 
        made based solely on this report.</i>
        """
        
        elements.append(Paragraph(glossary, self.styles['Normal']))
        
        return elements

    def generate_report(self, flood_data, weather_data=None):
        """Generate complete PDF report"""
        buffer = io.BytesIO()
        
        # Create document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=20*mm,
            leftMargin=20*mm,
            topMargin=25*mm,
            bottomMargin=20*mm
        )
        
        # Build content
        elements = []
        report_id = f"NDMA-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        # Add all sections
        elements.extend(self._create_cover_page(report_id))
        elements.extend(self._create_executive_summary(flood_data))
        elements.extend(self._create_water_levels_section(flood_data))
        elements.extend(self._create_recommendations(flood_data))
        elements.extend(self._create_appendix())
        
        # Build PDF
        doc.build(elements, onFirstPage=self._add_header_footer, onLaterPages=self._add_header_footer)
        
        buffer.seek(0)
        return buffer

# Create singleton instance
pdf_generator = PDFReportGenerator()

def generate_pdf_report(flood_data, weather_data=None):
    """Convenience function to generate report"""
    return pdf_generator.generate_report(flood_data, weather_data)
