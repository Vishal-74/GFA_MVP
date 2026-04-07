'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 60,
    backgroundColor: '#0c0a09',
    color: '#fafaf9',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    textAlign: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#c6a76a',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#a8a29e',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fafaf9',
    marginVertical: 20,
  },
  body: {
    fontSize: 16,
    lineHeight: 1.8,
    color: '#d6d3d1',
    marginVertical: 8,
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fafaf9',
    marginVertical: 20,
  },
  footer: {
    marginTop: 50,
    fontSize: 10,
    color: '#78716c',
    textAlign: 'center',
  },
  divider: {
    width: 100,
    height: 2,
    backgroundColor: '#c6a76a',
    marginVertical: 20,
  }
})

function CertificatePDF({ studentName, courseName, lecturerName, date }: {
  studentName: string
  courseName: string
  lecturerName: string
  date: string
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.title}>GLOBAL FREEDOM ACADEMY</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>Certificate of Completion</Text>
          <Text style={styles.body}>This certifies that</Text>
          <Text style={styles.name}>{studentName}</Text>
          <Text style={styles.body}>has successfully completed</Text>
          <Text style={styles.courseName}>{courseName}</Text>
          <Text style={styles.body}>Examined and endorsed by {lecturerName}</Text>
          <Text style={styles.footer}>
            Issued {date} · globalfreedomacademy.com{'\n'}
            No prerequisites. No gatekeepers.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

export default function CertificateGenerator({ 
  studentName, 
  courseName, 
  lecturerName 
}: {
  studentName: string
  courseName: string
  lecturerName: string
}) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <PDFDownloadLink
      document={
        <CertificatePDF
          studentName={studentName}
          courseName={courseName}
          lecturerName={lecturerName}
          date={date}
        />
      }
      fileName={`GFA_Certificate_${courseName.replace(/\s+/g, '_')}.pdf`}
    >
      {({ loading }) => (
        <button
          type="button"
          className="rounded-full bg-gfa-accent px-10 py-3.5 text-sm font-medium tracking-wide text-gfa-on-accent transition-colors hover:bg-gfa-accent-bright disabled:opacity-50"
        >
          {loading ? 'Preparing PDF…' : 'Download certificate'}
        </button>
      )}
    </PDFDownloadLink>
  )
}
