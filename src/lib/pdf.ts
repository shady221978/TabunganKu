import { User, Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { mockTransactions } from '@/lib/mockData';

export async function generateTransactionPDF(user: User): Promise<void> {
  const transactions = mockTransactions.getTransactions()
    .filter(t => t.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Create PDF content as HTML
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #22c55e; margin-bottom: 10px; }
        .header-subtitle { color: #666; font-size: 14px; }
        .profile-section { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding: 20px; background: #f8f8f8; border-radius: 8px; }
        .profile-photo { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #22c55e; }
        .profile-info { flex: 1; }
        .profile-info h2 { font-size: 24px; margin-bottom: 5px; color: #333; }
        .profile-info p { color: #666; margin-bottom: 3px; font-size: 14px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .summary-card h3 { font-size: 14px; opacity: 0.9; margin-bottom: 8px; font-weight: normal; }
        .summary-card p { font-size: 24px; font-weight: bold; }
        .transactions-section { margin-top: 30px; }
        .section-title { font-size: 20px; font-weight: bold; color: #333; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e5e5; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { background: #f8f8f8; padding: 12px; text-align: left; font-size: 13px; color: #666; font-weight: 600; border-bottom: 2px solid #e5e5e5; }
        td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .type-deposit { color: #22c55e; font-weight: 600; }
        .type-withdraw { color: #ef4444; font-weight: 600; }
        .type-bonus { color: #3b82f6; font-weight: 600; }
        .status-completed { background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .status-pending { background: #fef3c7; color: #ca8a04; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .status-rejected { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
        .print-date { color: #666; font-size: 12px; margin-top: 10px; }
        @media print {
          body { background: white; padding: 0; }
          .container { box-shadow: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💰 TabunganKu</div>
          <div class="header-subtitle">Laporan Riwayat Transaksi Tabungan</div>
        </div>
        
        <div class="profile-section">
          <img src="${user.photo}" alt="${user.name}" class="profile-photo" />
          <div class="profile-info">
            <h2>${user.name}</h2>
            <p><strong>No. Anggota:</strong> ${user.memberNumber}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Telepon:</strong> ${user.phone}</p>
            <p><strong>Terdaftar:</strong> ${formatDateTime(user.registrationDate)}</p>
          </div>
        </div>
        
        <div class="summary-grid">
          <div class="summary-card">
            <h3>Saldo Tabungan</h3>
            <p>${formatCurrency(user.balance)}</p>
          </div>
          <div class="summary-card">
            <h3>Total Poin</h3>
            <p>${formatCurrency(user.points)}</p>
          </div>
          <div class="summary-card">
            <h3>Total Transaksi</h3>
            <p>${transactions.length}</p>
          </div>
        </div>
        
        <div class="transactions-section">
          <div class="section-title">Riwayat Transaksi</div>
          ${transactions.length === 0 ? `
            <p style="text-align: center; color: #999; padding: 40px 0;">Belum ada transaksi</p>
          ` : `
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Nominal</th>
                  <th>Poin</th>
                  <th>Status</th>
                  <th>Metode</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td>${formatDateTime(t.createdAt)}</td>
                    <td class="type-${t.type}">
                      ${t.type === 'deposit' ? 'Setoran' : t.type === 'withdraw' ? 'Penarikan' : 'Bonus'}
                    </td>
                    <td>${formatCurrency(t.amount)}</td>
                    <td>${t.pointsEarned ? formatCurrency(t.pointsEarned) : '-'}</td>
                    <td><span class="status-${t.status}">
                      ${t.status === 'completed' ? 'Selesai' : t.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                    </span></td>
                    <td>${t.paymentMethod || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
        
        <div class="footer">
          <p>Dokumen ini dicetak otomatis oleh sistem TabunganKu</p>
          <p class="print-date">Dicetak pada: ${formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Open new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(pdfContent);
    printWindow.document.close();
    
    // Wait for images to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
