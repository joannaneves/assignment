const puppeteer = require("puppeteer")
const fs = require("fs")

;(async () => {
  try {
    console.log("Launching the browser...")

    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ headless: false }) // Set headless: true for background execution
    const page = await browser.newPage()

    console.log("Starting a quick profile...")
    // Step 1: Navigate to the Multilogin quick profile setup page
    await page.goto("https://app.multilogin.com/en/home/profiles", {
      waitUntil: "networkidle2",
    })

    console.log("Fetching weather for 5 cities...")
    // Array of capital cities
    const cities = ["London", "Tokyo", "Paris", "New York", "Sydney"]
    const weatherResults = []

    for (const city of cities) {
      // Step 2: Search weather for each city
      await page.goto(`https://www.google.com/search?q=${city}+weather`, {
        waitUntil: "networkidle2",
      })

      // Step 3: Scrape weather data
      const weather = await page.evaluate(() => {
        const tempElement = document.querySelector("span#wob_tm")
        const conditionElement = document.querySelector("div#wob_dcp")
        return {
          temperature: tempElement ? tempElement.textContent : "N/A",
          condition: conditionElement ? conditionElement.textContent : "N/A",
        }
      })

      weatherResults.push({ city, ...weather })
    }

    console.log("Weather data collected:", weatherResults)

    // Log the weather summary
    console.log("\nWeather Summary:")
    weatherResults.forEach((result) => {
      console.log(
        `${result.city}: ${result.temperature}°C, ${result.condition}`
      )
    })

    // Generate an HTML file with the results
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weather Results</title>
        <style>
          body { font-family: Arial, sans-serif; }
          ul { list-style-type: none; padding: 0; }
          li { margin: 5px 0; }
        </style>
      </head>
      <body>
        <h1>Weather in 5 Cities</h1>
        <ul>
          ${weatherResults
            .map(
              (result) => `
            <li>
              <strong>${result.city}:</strong> ${result.temperature}°C, ${result.condition}
            </li>
          `
            )
            .join("")}
        </ul>
      </body>
      </html>
    `

    // Write the HTML content to a file
    fs.writeFileSync("output.html", htmlContent, "utf8")
    console.log("Weather results saved to output.html")

    console.log("Closing the browser...")
    await browser.close()
  } catch (error) {
    console.error("An error occurred:", error)
  }
})()
