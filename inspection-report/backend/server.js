import express from "express";
import puppeteer from "puppeteer";
import cors from "cors";

const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

// Route: Generate PDF for a given inspection
app.get("/api/report/pdf/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Load the Astro report editor page for this inspection
    await page.goto(`http://localhost:4321/view/edit/${id}`, {
    waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Send PDF back to browser
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="inspection-${id}.pdf"`);
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate PDF");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
