import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    width: '210mm',
    height: '297mm',
    backgroundColor: '#fff',
    padding: 0,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  border: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#6bc8dc',
  },
  content: {
    position: 'absolute',
    top: 45,
    left: 22,
    right: 22,
    bottom: 25,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  crest: {
    height: 180,
    marginBottom: 5,
    objectFit: 'contain',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Times-Roman',
    marginBottom: 15,
  },
  userName: {
    fontSize: 30,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 15,
    width: '90%',
  },
  courseName: {
    fontSize: 26,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 15,
    width: '90%',
  },
  institution: {
    fontSize: 20,
    fontFamily: 'Times-Bold',
    textAlign: 'center',
    marginBottom: 10,
    width: '75%',
  },
  kaspar: {
    fontSize: 18,
    fontFamily: 'Times-Roman',
    textAlign: 'center',
    marginBottom: 2,
  },
  approvedCentre: {
    fontSize: 12,
    fontFamily: 'Times-BoldItalic',
    textAlign: 'center',
    marginBottom: 10,
  },
  signatureSection: {
    marginTop: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sideSpacer: {
    width: 105,
  },
  logoColumn: {
    width: 105,
    paddingTop: 110,
    alignItems: 'center',
  },
  ioshLogo: {
    width: 80,
    objectFit: 'contain',
  },
  centerSignatures: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureItem: {
    alignItems: 'center',
    marginBottom: -30,
  },
  signatureImage: {
    height: 120,
    objectFit: 'contain',
  },
  signatureLabel: {
    fontSize: 13,
    fontFamily: 'Times-Roman',
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingLeft: 16,
    paddingRight: 16,
  },
  qrContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  qrFrame: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
  },
  qrImage: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 48,
    height: 48,
  },
  certInfo: {
    textAlign: 'left',
    fontSize: 11,
  },
  certInfoRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  labelBold: {
    fontFamily: 'Times-Bold',
  },
});

interface CertificatePDFProps {
  userName: string;
  courseName: string;
  certificateNumber: string;
  issuedDateText: string;
  qrCodeDataUrl: string;
  assetPaths: {
    bg: string;
    logo1: string;
    logo2: string;
    logo3: string;
    logo4: string;
    logo5: string;
  };
}

export const CertificatePDF = ({
  userName,
  courseName,
  certificateNumber,
  issuedDateText,
  qrCodeDataUrl,
  assetPaths,
}: CertificatePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image src={assetPaths.bg} style={styles.backgroundImage} />
      <View style={styles.border} />
      <View style={styles.content}>
        <Image src={assetPaths.logo2} style={styles.crest} />
        <Text style={styles.subtitle}>This is a certificate awarded to</Text>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.subtitle}>on successfully completing</Text>
        <Text style={styles.courseName}>{courseName}</Text>
        <Text style={styles.subtitle}>a course approved and validated by the</Text>
        <Text style={styles.institution}>Institution of Occupational Safety and Health</Text>
        <Text style={styles.subtitle}>in association with</Text>
        <Text style={styles.kaspar}>Kaspar International Training Services Private Ltd</Text>
        <Text style={styles.approvedCentre}>Approved Centre: 5264</Text>
        
        <View style={styles.signatureSection}>
          <View style={styles.logoColumn}>
            <Image src={assetPaths.logo1} style={styles.ioshLogo} />
          </View>
          <View style={styles.centerSignatures}>
            <View style={styles.signatureItem}>
              <Text style={styles.signatureLabel}>Signed on behalf of IOSH</Text>
              <Image src={assetPaths.logo5} style={styles.signatureImage} />
              <Text style={styles.signatureLabel}>Chief Executive</Text>
            </View>
            <View style={styles.signatureItem}>
               <Image src={assetPaths.logo4} style={styles.signatureImage} />
               <Text style={styles.signatureLabel}>Course Organiser</Text>
            </View>
          </View>
          <View style={styles.sideSpacer} />
        </View>

        <View style={styles.footer}>
          <View style={styles.qrContainer}>
            <Image src={assetPaths.logo3} style={styles.qrFrame} />
            <Image src={qrCodeDataUrl} style={styles.qrImage} />
          </View>
          <View style={styles.certInfo}>
            <View style={styles.certInfoRow}>
              <Text style={styles.labelBold}>IOSH certificate number: </Text>
              <Text>{certificateNumber}</Text>
            </View>
            <View style={styles.certInfoRow}>
              <Text style={styles.labelBold}>Issued Date: </Text>
              <Text>{issuedDateText}</Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
