function doGet(e) {
  // 任意: シート名や範囲をパラメータで切り替えたい場合は e.parameter を使用
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Words"); // シート名は必要に応じて変更
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Sheet 'Words' not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const range = sheet.getDataRange();
  const values = range.getValues();
  const headers = values.shift(); // 1行目をヘッダとして除去

  // ヘッダの期待値チェック（任意）
  const expected = ["term", "meaning", "cat", "examples", "pron"];
  const ok = expected.every((h, i) => headers[i] === h);
  if (!ok) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Header mismatch. Expected: " + expected.join(", ") }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const list = values
    .filter(row => row.some(v => v !== "")) // 完全空行を除外
    .map(row => ({
      term: String(row[0] || "").trim(),
      meaning: String(row[1] || "").trim(),
      cat: String(row[2] || "").trim(),
      // examples はサイト側の仕様に合わせて配列で返す（1件のみでも配列）
      examples: row[3] ? [String(row[3]).trim()] : [],
      pron: String(row[4] || "").trim()
    }));

  const output = JSON.stringify(list);
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}