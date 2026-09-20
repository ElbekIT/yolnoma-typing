<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="uz">
      <head>
        <title>Sayt Xaritasi | Yolnoma Typing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <style>
          body {
            background-color: #090d16;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          .header {
            margin-bottom: 30px;
            border-bottom: 1px solid #1e293b;
            padding-bottom: 20px;
          }
          h1 {
            color: #38bdf8;
            font-size: 28px;
            margin: 0 0 10px 0;
          }
          p {
            color: #94a3b8;
            font-size: 14px;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #0f172a;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #1e293b;
          }
          th {
            background-color: #1e293b;
            color: #e2e8f0;
            text-align: left;
            padding: 12px 16px;
            font-size: 13px;
            text-transform: uppercase;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #1e293b;
            font-size: 14px;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:hover td {
            background-color: #1e293b40;
          }
          a {
            color: #38bdf8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .badge {
            background: #0284c720;
            color: #38bdf8;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Yolnoma Typing — Sayt Xaritasi</h1>
            <p>Ushbu sahifa qidiruv tizimlari (Google, Yandex) va foydalanuvchilar uchun sayt sahifalarini ko'rsatadi.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Sahifa havolasi (URL)</th>
                <th>Yangilanish</th>
                <th>Muhimlik</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="//*[local-name()='url']">
                <tr>
                  <td>
                    <a href="{*[local-name()='loc']}"><xsl:value-of select="*[local-name()='loc']"/></a>
                  </td>
                  <td><xsl:value-of select="*[local-name()='changefreq']"/></td>
                  <td>
                    <span class="badge"><xsl:value-of select="*[local-name()='priority']"/></span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
