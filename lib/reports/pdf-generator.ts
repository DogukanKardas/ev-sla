import jsPDF from 'jspdf'
import 'jspdf-autotable'

export interface KPIReportData {
  user: {
    full_name: string
  }
  month: number
  year: number
  kpi_metric: {
    work_hours_total: number
    work_hours_target: number
    avg_response_time_seconds: number
    response_time_target_seconds: number
    task_completion_rate: number
    task_completion_target: number
    productivity_score: number
    productivity_target: number
  }
  evaluation?: {
    overall_score: number
    comments: string
    user_profiles?: {
      full_name: string
    }
  }
  summary: {
    total_attendance_days: number
    total_work_logs: number
    total_message_responses: number
  }
}

export function generateKPIReportPDF(data: KPIReportData): jsPDF {
  const doc = new jsPDF()
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  // Title
  doc.setFontSize(20)
  doc.text('KPI Raporu', 105, 20, { align: 'center' })

  // User and Period Info
  doc.setFontSize(12)
  doc.text(`Çalışan: ${data.user.full_name}`, 20, 35)
  doc.text(`Dönem: ${monthNames[data.month - 1]} ${data.year}`, 20, 42)

  // KPI Metrics Table
  const metricsData = [
    [
      'Çalışma Saatleri',
      `${data.kpi_metric.work_hours_total.toFixed(2)} saat`,
      `${data.kpi_metric.work_hours_target} saat`,
      `${((data.kpi_metric.work_hours_total / data.kpi_metric.work_hours_target) * 100).toFixed(1)}%`
    ],
    [
      'Ortalama Yanıt Süresi',
      `${Math.floor(data.kpi_metric.avg_response_time_seconds / 60)} dakika`,
      `${Math.floor(data.kpi_metric.response_time_target_seconds / 60)} dakika`,
      `${((data.kpi_metric.response_time_target_seconds / data.kpi_metric.avg_response_time_seconds) * 100).toFixed(1)}%`
    ],
    [
      'Görev Tamamlama Oranı',
      `${data.kpi_metric.task_completion_rate.toFixed(2)}%`,
      `${data.kpi_metric.task_completion_target}%`,
      `${((data.kpi_metric.task_completion_rate / data.kpi_metric.task_completion_target) * 100).toFixed(1)}%`
    ],
    [
      'Verimlilik Skoru',
      `${data.kpi_metric.productivity_score.toFixed(2)}%`,
      `${data.kpi_metric.productivity_target}%`,
      `${((data.kpi_metric.productivity_score / data.kpi_metric.productivity_target) * 100).toFixed(1)}%`
    ],
  ]

  ;(doc as any).autoTable({
    startY: 50,
    head: [['Metrik', 'Gerçekleşen', 'Hedef', 'Başarı Oranı']],
    body: metricsData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
  })

  // Summary
  let summaryY = (doc as any).lastAutoTable.finalY + 20
  doc.setFontSize(14)
  doc.text('Özet', 20, summaryY)
  
  summaryY += 10
  doc.setFontSize(10)
  doc.text(`Toplam Giriş Günü: ${data.summary.total_attendance_days}`, 20, summaryY)
  summaryY += 7
  doc.text(`Toplam İş Kaydı: ${data.summary.total_work_logs}`, 20, summaryY)
  summaryY += 7
  doc.text(`Toplam Mesaj Yanıtı: ${data.summary.total_message_responses}`, 20, summaryY)

  // Evaluation
  if (data.evaluation) {
    summaryY += 15
    doc.setFontSize(14)
    doc.text('Değerlendirme', 20, summaryY)
    
    summaryY += 10
    doc.setFontSize(10)
    doc.text(`Genel Skor: ${data.evaluation.overall_score}/100`, 20, summaryY)
    
    let splitComments: string[] = []
    if (data.evaluation.comments) {
      summaryY += 10
      doc.setFontSize(10)
      splitComments = doc.splitTextToSize(
        `Yorumlar: ${data.evaluation.comments}`,
        170
      )
      doc.text(splitComments, 20, summaryY)
    }

    if (data.evaluation.user_profiles) {
      summaryY += (splitComments.length > 0 ? splitComments.length * 7 : 0) + 5
      doc.setFontSize(8)
      doc.text(
        `Değerlendiren: ${data.evaluation.user_profiles.full_name}`,
        20,
        summaryY
      )
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.text(
      `Sayfa ${i} / ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  return doc
}

