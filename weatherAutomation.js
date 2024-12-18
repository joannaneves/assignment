const puppeteer = require("puppeteer")

;(async () => {
  try {
    console.log("Launching the browser...")

    const browser = await puppeteer.launch({ headless: false }) // Set headless: true for background execution
    const page = await browser.newPage()

    console.log("Starting a quick profile...")
    // Step 1: Navigate to a quick profile setup page (adjust if API details are provided)
    await page.goto("https://www.multilogin.com/", {
      waitUntil: "networkidle2",
    })

    console.log("Fetching weather for 5 cities...")
    const cities = ["London", "Tokyo", "Paris", "New York", "Sydney"]
    const weatherResults = []

    for (const city of cities) {
      await page.goto(`https://www.google.com/search?q=${city}+weather`, {
        waitUntil: "networkidle2",
      })

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

    console.log("\nWeather Summary:")
    weatherResults.forEach((result) => {
      console.log(
        `${result.city}: ${result.temperature}°C, ${result.condition}`
      )
    })

    console.log("Closing the browser...")
    await browser.close()
  } catch (error) {
    console.error("An error occurred:", error)
  }
})()
