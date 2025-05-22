// Utility: delay function for animation timing
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const aiResponse = (function () {
  let riddleState = {
    active: false,
    currentRiddle: null,
    currentAnswer: null,
    attempts: 0,
  };

  let newsState = {
    waitingForCategory: false,
    waitingForDisasterType: false,
    lastDisasterType: null,
  };

  return async function (input) {
    input = input.toLowerCase().trim();

    // Helper function to summarize text by extracting important sentences (not always first 2)
    function summarizeText(text) {
      if (!text) return "";
      // Split text into sentences using regex to capture sentence endings
      const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];

      // Define some important keywords to boost sentence score
      const importantKeywords = [
        "penting",
        "informasi",
        "berita",
        "hasil",
        "kesimpulan",
        "ringkas",
        "intinya",
        "utama",
        "fakta",
        "data",
        "analisis",
        "temuan",
        "laporan",
        "detail",
        "penjelasan",
        "tujuan",
        "manfaat",
        "kunci",
        "highlight",
      ];

      // Score each sentence based on length and presence of important keywords
      const sentenceScores = sentences.map((sentence) => {
        let score = 0;
        const lowerSentence = sentence.toLowerCase();

        // Add score for sentence length (longer sentences get more score, capped)
        score += Math.min(lowerSentence.length / 100, 1);

        // Add score for each important keyword found in sentence
        for (const keyword of importantKeywords) {
          if (lowerSentence.includes(keyword)) {
            score += 1;
          }
        }
        return { sentence, score };
      });

      // Sort sentences by score descending
      sentenceScores.sort((a, b) => b.score - a.score);

      // Pick top 5 sentences with highest scores for longer summary
      let topSentences = sentenceScores.slice(0, 5).map((item) => item.sentence.trim());

      // Shuffle the selected sentences to make summary less predictable
      for (let i = topSentences.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [topSentences[i], topSentences[j]] = [topSentences[j], topSentences[i]];
      }

      // Join selected sentences as summary
      const summary = topSentences.join(" ");

      return summary;
    }

    // Detect summarization commands
    const summarizeKeywords = [
      "ringkas",
      "ringkasan",
      "summary",
      "ngerangkas",
      "buat ringkasan",
      "buat ringkas",
      "buat summary",
      "tolong ringkas",
      "tolong buat ringkasan",
      "tolong buat ringkas",
      "tolong buat summary",
    ];

    // Check if input starts with or includes any summarize keyword
    let isSummarizeRequest = false;
    let textToSummarize = "";

    for (const keyword of summarizeKeywords) {
      if (input.startsWith(keyword)) {
        isSummarizeRequest = true;
        textToSummarize = input.slice(keyword.length).trim();
        break;
      } else if (input.includes(keyword)) {
        isSummarizeRequest = true;
        // Extract text after keyword
        const index = input.indexOf(keyword);
        textToSummarize = input.slice(index + keyword.length).trim();
        break;
      }
    }

    if (isSummarizeRequest) {
      if (!textToSummarize) {
        return "Silakan berikan teks yang ingin diringkas.";
      }
      const summary = summarizeText(textToSummarize);
      if (!summary) {
        return "Maaf, saya tidak dapat membuat ringkasan dari teks tersebut.";
      }
      return `Ringkasan:\n${summary}`;
    }

    // Handle conversion requests
    async function convertCurrency(amount, fromCurrency, toCurrency) {
      fromCurrency = fromCurrency.toUpperCase();
      toCurrency = toCurrency.toUpperCase();

      // Static exchange rates relative to USD (example rates, should be updated regularly)
      const exchangeRates = {
        IDR: 16436, // Rupiah
        USD: 1, // Dolar Amerika
        EUR: 0.92, // Euro
        GBP: 0.79, // Poundsterling
        JPY: 156.3, // Yen Jepang
        KRW: 1360, // Won Korea
        CNY: 7.23, // Yuan Cina
        AUD: 1.51, // Dolar Australia
        CAD: 1.36, // Dolar Kanada
        CHF: 0.91, // Franc Swiss
        SEK: 10.62, // Krona Swedia
        NZD: 1.65, // Dolar Selandia Baru
        MYR: 4.72, // Ringgit Malaysia
        SAR: 3.75, // Riyal Saudi
        AED: 3.67, // Dirham Uni Emirat Arab
        KWD: 0.31, // Dinar Kuwait
        BND: 1.35, // Dolar Brunei
        RUB: 92.5, // Rubel Rusia
        SGD: 1.35, // Dolar Singapura
        THB: 36.2, // Baht Thailand
        PHP: 56.8, // Peso Filipina
        INR: 83.5, // Rupee India
        HKD: 7.83, // Dolar Hong Kong
        ZAR: 18.6, // Rand Afrika Selatan
      };

      if (!(fromCurrency in exchangeRates) || !(toCurrency in exchangeRates)) {
        return "Maaf, kode mata uang tidak dikenali atau tidak didukung.";
      }

      // Convert amount to USD first, then to target currency
      const amountInUSD = amount / exchangeRates[fromCurrency];
      const convertedAmount = amountInUSD * exchangeRates[toCurrency];

      return `${amount} ${fromCurrency} sama dengan ${Math.round(
        convertedAmount
      )} ${toCurrency}. (Perkiraan Kurs Mata Uang Saat Ini)`;
    }

    function convertTemperature(value, fromUnit, toUnit) {
      fromUnit = fromUnit.toLowerCase();
      toUnit = toUnit.toLowerCase();
      let celsius;

      // Convert from source to Celsius
      if (
        fromUnit === "c" ||
        fromUnit === "°c" ||
        fromUnit === "celcius" ||
        fromUnit === "celsius"
      ) {
        celsius = value;
      } else if (
        fromUnit === "f" ||
        fromUnit === "°f" ||
        fromUnit === "fahrenheit"
      ) {
        celsius = (value - 32) * (5 / 9);
      } else if (fromUnit === "k" || fromUnit === "kelvin") {
        celsius = value - 273.15;
      } else {
        return null;
      }

      // Convert from Celsius to target
      if (
        toUnit === "c" ||
        toUnit === "°c" ||
        toUnit === "celcius" ||
        toUnit === "celsius"
      ) {
        return celsius;
      } else if (toUnit === "f" || toUnit === "°f" || toUnit === "fahrenheit") {
        return celsius * (9 / 5) + 32;
      } else if (toUnit === "k" || toUnit === "kelvin") {
        return celsius + 273.15;
      } else {
        return null;
      }
    }

    function convertLength(value, fromUnit, toUnit) {
      const units = {
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        in: 0.0254,
        ft: 0.3048,
        yd: 0.9144,
        mi: 1609.344,
      };
      fromUnit = fromUnit.toLowerCase();
      toUnit = toUnit.toLowerCase();
      if (!(fromUnit in units) || !(toUnit in units)) {
        return null;
      }
      const meters = value * units[fromUnit];
      return meters / units[toUnit];
    }

    function convertWeight(value, fromUnit, toUnit) {
      const units = {
        mg: 0.000001,
        g: 0.001,
        kg: 1,
        t: 1000,
        oz: 0.0283495,
        lb: 0.453592,
        st: 6.35029,
      };
      fromUnit = fromUnit.toLowerCase();
      toUnit = toUnit.toLowerCase();
      if (!(fromUnit in units) || !(toUnit in units)) {
        return null;
      }
      const kilograms = value * units[fromUnit];
      return kilograms / units[toUnit];
    }

    function convertTime(value, fromUnit, toUnit) {
      const units = {
        s: 1,
        sec: 1,
        second: 1,
        seconds: 1,
        detik: 1,
        dtk: 1,
        m: 60,
        min: 60,
        minute: 60,
        minutes: 60,
        menit: 60,
        h: 3600,
        hr: 3600,
        hour: 3600,
        hours: 3600,
        jam: 3600,
        d: 86400,
        day: 86400,
        days: 86400,
        hari: 86400,
        minggu: 604800, // 7 days
        bln: 2592000, // 30 days approx
        bulan: 2592000,
        thn: 31536000, // 365 days approx
        tahun: 31536000,
      };
      fromUnit = fromUnit.toLowerCase();
      toUnit = toUnit.toLowerCase();
      if (!(fromUnit in units) || !(toUnit in units)) {
        return null;
      }
      const seconds = value * units[fromUnit];
      return seconds / units[toUnit];
    }

    // Parse conversion input patterns
    // Examples:
    // "konversi suhu 100 c ke f"
    // "konversi panjang 5 km ke m"
    // "konversi berat 10 kg ke lb"
    // "konversi waktu 3600 detik ke jam"
    // "konversi uang 100 usd ke idr"
    const conversionRegex =
      /konversi\s+(suhu|panjang|berat|waktu|uang)\s+([\d.,]+)\s*([a-z°]+)\s*(ke|to)\s*([a-z]+)/i;
    const match = input.match(conversionRegex);
    if (match) {
      const type = match[1].toLowerCase();
      const value = parseFloat(match[2].replace(",", "."));
      const fromUnit = match[3].toLowerCase();
      const toUnit = match[5].toLowerCase();

      if (isNaN(value)) {
        return "Maaf, nilai yang Anda masukkan tidak valid.";
      }

      if (type === "suhu") {
        const result = convertTemperature(value, fromUnit, toUnit);
        if (result === null) {
          return "Maaf, satuan suhu tidak dikenali.";
        }
        // Round temperature result: round if > 10, else 2 decimals
        const roundedResult =
          Math.abs(result) > 10
            ? Math.round(result)
            : parseFloat(result.toFixed(2));
        return `${value} ${fromUnit} sama dengan ${roundedResult} ${toUnit}.`;
      } else if (type === "panjang") {
        const result = convertLength(value, fromUnit, toUnit);
        if (result === null) {
          return "Maaf, satuan panjang tidak dikenali.";
        }
        // Round length result: round if > 10, else 4 decimals
        const roundedResult =
          Math.abs(result) > 10
            ? Math.round(result)
            : parseFloat(result.toFixed(4));
        return `${value} ${fromUnit} sama dengan ${roundedResult} ${toUnit}.`;
      } else if (type === "berat") {
        const result = convertWeight(value, fromUnit, toUnit);
        if (result === null) {
          return "Maaf, satuan berat tidak dikenali.";
        }
        // Round weight result: round if > 10, else 4 decimals
        const roundedResult =
          Math.abs(result) > 10
            ? Math.round(result)
            : parseFloat(result.toFixed(4));
        return `${value} ${fromUnit} sama dengan ${roundedResult} ${toUnit}.`;
      } else if (type === "waktu") {
        const result = convertTime(value, fromUnit, toUnit);
        if (result === null) {
          return "Maaf, satuan waktu tidak dikenali.";
        }
        // Use Indonesian terms for units in the response
        const unitNames = {
          s: "detik",
          sec: "detik",
          second: "detik",
          seconds: "detik",
          detik: "detik",
          dtk: "detik",
          m: "menit",
          min: "menit",
          minute: "menit",
          minutes: "menit",
          menit: "menit",
          h: "jam",
          hr: "jam",
          hour: "jam",
          hours: "jam",
          jam: "jam",
          d: "hari",
          day: "hari",
          days: "hari",
          hari: "hari",
          minggu: "minggu",
          bln: "bulan",
          bulan: "bulan",
          thn: "tahun",
          tahun: "tahun",
        };
        const fromUnitName = unitNames[fromUnit] || fromUnit;
        const toUnitName = unitNames[toUnit] || toUnit;
        // Round time result: round if > 10, else 4 decimals
        const roundedResult =
          Math.abs(result) > 10
            ? Math.round(result)
            : parseFloat(result.toFixed(4));
        return `${value} ${fromUnitName} sama dengan ${roundedResult} ${toUnitName}.`;
      } else if (type === "uang") {
        // Currency conversion is async, so return a Promise
        return await convertCurrency(value, fromUnit, toUnit);
      } else {
        return "Maaf, tipe konversi tidak dikenali.";
      }
    }

    // Handle translation requests
    if (
      input.includes("translate") ||
      input.includes("terjemah") ||
      input.includes("menerjemah") ||
      input.includes("alih bahasa") ||
      input.includes("translate to") ||
      input.includes("translate from") ||
      input.includes("terjemahkan")
    ) {
      // Extract text to translate if possible (simple heuristic)
      // Otherwise, provide general Google Translate link
      let textToTranslate = "";
      const translateRegex =
        /(?:translate|terjemah|terjemahkan|menerjemah|alih bahasa)(?: dari [a-z]+ ke [a-z]+)?(?: )?(.*)/i;
      const match = input.match(translateRegex);
      if (match && match[1]) {
        textToTranslate = match[1].trim();
      }

      // Encode text for URL
      const encodedText = encodeURIComponent(textToTranslate);

      // Determine source and target languages (basic detection)
      let sl = "auto";
      let tl = "id";

      if (
        input.includes("english to indonesian") ||
        input.includes("inggris ke indonesia") ||
        input.includes("english ke indonesia")
      ) {
        sl = "en";
        tl = "id";
      } else if (
        input.includes("indonesian to english") ||
        input.includes("indonesia ke inggris") ||
        input.includes("indonesia to english")
      ) {
        sl = "id";
        tl = "en";
      }

      const googleTranslateUrl = textToTranslate
        ? `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodedText}&op=translate`
        : "https://translate.google.com/";

      // Return link text "Google Translate" as clickable link that opens in new tab
      return `Untuk menerjemahkan, silakan klik <a href="${googleTranslateUrl}" target="_blank" rel="noopener noreferrer">Google Translate</a> untuk membuka halaman terjemahan.`;
    }

    // Handle greetings and common conversational phrases
    if (
      input === "hai" ||
      input === "halo" ||
      input === "hello" ||
      input === "hi" ||
      input === "hey"
    ) {
      return "Hai! Gimana kabarnya? Butuh bantuan atau mau tanya sesuatu?";
    }

    if (input === "askha ai") {
      return "Hai! Kamu nyari Askha AI? Aku di sini, siap bantu kamu. Ada yang mau ditanya?";
    }

    if (input === "bagaimana kabarmu" || input === "apa kabar") {
      return "Saya baik, terima kasih sudah bertanya! Bagaimana kabarmu?";
    }

    if (
      input === "baik" ||
      input === "saya baik" ||
      input === "saya juga baik"
    ) {
      return "Senang mendengarnya! Ada yang bisa saya bantu atau mau tanya sesuatu?";
    }

    if (input === "bantu saya" || input === "tolong" || input === "help") {
      return "Tentu, saya di sini untuk membantu Kamu. Silakan ajukan pertanyaan, atau beri tahu jika ada yang bisa saya bantu";
    }

    // Respond to thanks, praise, insults
    const thanksKeywords = ["terimakasih", "makasih", "thanks", "thank you"];
    const praiseKeywords = [
      "bagus",
      "hebat",
      "kerja bagus",
      "mantap",
      "luar biasa",
      "keren",
      "pintar",
    ];
    const insultKeywords = ["bodoh", "jelek", "goblok", "tolol", "idiot"];

    for (const word of thanksKeywords) {
      if (input.includes(word)) {
        return "Sama-sama! Senang bisa membantu Kamu.";
      }
    }
    for (const word of praiseKeywords) {
      if (input.includes(word)) {
        return "Terima kasih atas pujiannya! Saya akan terus berusaha menjadi lebih baik.";
      }
    }
    for (const word of insultKeywords) {
      if (input.includes(word)) {
        return "Maaf jika ada yang membuatmu kesal. Saya hanyalah AI sederhana yang masih terus dikembangkan, dan mungkin belum sempurna dalam memahami semua situasi. Saya akan terus belajar dan berusaha menjadi lebih baik.";
      }
    }

    // General question keywords
    const questionWords = [
      "apa",
      "dimana",
      "kapan",
      "siapa",
      "mengapa",
      "bagaimana",
    ];

    for (const qWord of questionWords) {
      if (input.startsWith(qWord)) {
        if (qWord === "apa") {
          if (
            input.includes("apa itu ai") ||
            input.includes("apa itu artificial intelligence")
          ) {
            return "AI atau kecerdasan buatan adalah bidang ilmu komputer yang berfokus pada pembuatan mesin yang dapat meniru kecerdasan manusia.";
          }
          return "Itu adalah pertanyaan yang bagus. Bisa Anda jelaskan lebih spesifik?";
        }
        if (qWord === "dimana") {
          if (
            input.includes("dimana ai pertama kali diciptakan") ||
            input.includes(
              "dimana artificial intelligence pertama kali diciptakan"
            )
          ) {
            return "AI pertama kali dikembangkan di Dartmouth College, Amerika Serikat pada tahun 1956.";
          }
          return "Tempat itu tergantung konteksnya. Bisa Anda jelaskan lebih lanjut?";
        }
        if (qWord === "kapan") {
          if (
            input.includes("kapan ai pertama kali diciptakan") ||
            input.includes(
              "kapan artificial intelligence pertama kali diciptakan"
            )
          ) {
            return "AI pertama kali diciptakan pada tahun 1956 saat konferensi Dartmouth yang menjadi tonggak awal bidang ini.";
          }
          return "Waktu yang tepat tergantung situasi. Bisa Anda jelaskan lebih detail?";
        }
        if (qWord === "siapa") {
          if (input.includes("siapa kamu") || input.includes("siapa kamu?")) {
            return "Saya adalah AskHa AI, chatbot cerdas yang dibuat untuk membantu menjawab pertanyaan Anda.";
          }
          if (
            input.includes("siapa yang membuatmu") ||
            input.includes("siapa pembuatmu")
          ) {
            return "Saya dibuat oleh pengembang yang ingin membantu Anda dengan pertanyaan dan perhitungan.";
          }
          return "Itu tergantung siapa yang Anda maksud. Bisa Anda jelaskan lebih spesifik?";
        }
        if (qWord === "mengapa") {
          if (
            input.includes("mengapa kamu dibuat") ||
            input.includes("mengapa kamu dibuat?")
          ) {
            return "Saya dibuat untuk membantu pengguna menjawab pertanyaan dan memberikan informasi dengan cepat dan mudah.";
          }
          return "Alasan di balik itu bisa sangat beragam. Bisa Anda jelaskan lebih lanjut?";
        }
        if (qWord === "bagaimana") {
          if (
            input.includes("bagaimana cara ai bekerja") ||
            input.includes("bagaimana ai bekerja")
          ) {
            return "AI bekerja dengan memproses data menggunakan algoritma dan model pembelajaran mesin untuk mengenali pola dan membuat keputusan.";
          }
          return "Cara terbaik untuk itu tergantung pada konteks. Bisa Anda jelaskan lebih detail?";
        }
        return "Maaf, saya belum mengerti pertanyaan Anda.";
      }
    }

    // If user types "berita", prompt for category
    if (
      input === "berita" ||
      input === "berita terkini" ||
      input === "berita terbaru"
    ) {
      newsState.waitingForCategory = true;
      return (
        "Mau berita apa?\n\n" +
        "Dunia 🌍\n" +
        "Teknologi 💡\n" +
        "Astronomi 🔭\n" +
        "Olahraga ⚽\n" +
        "Indonesia 🇮🇩\n" +
        "Jambi 📍\n" +
        "Gempa Bumi Di Indonesia 💥"
      );
    }

    // Handle news category selection if waiting
    if (newsState.waitingForCategory) {
      newsState.waitingForCategory = false;
      if (input.includes("dunia")) {
        const rssUrl = "https://www.cnnindonesia.com/internasional/rss";
        return await fetchNews(rssUrl);
      } else if (input.includes("teknologi")) {
        const rssUrl = "https://www.theverge.com/rss/index.xml";
        return await fetchNews(rssUrl);
      } else if (input.includes("astronomi")) {
        const rssUrl = "https://www.nasa.gov/rss/dyn/breaking_news.rss";
        return await fetchNews(rssUrl);
      } else if (input.includes("olahraga")) {
        const rssUrl = "https://www.times.co.id/rss/category/olahraga";
        return await fetchNews(rssUrl);
      } else if (input.includes("ekonomi")) {
        const rssUrl = "https://www.cnbcindonesia.com/market/rss";
        return await fetchNews(rssUrl);
      } else if (input.includes("indonesia")) {
        const rssUrl = "https://www.cnnindonesia.com/nasional/rss";
        return await fetchNews(rssUrl);
      } else if (input.includes("jambi")) {
        const rssUrl = "https://jambi.antaranews.com/rss/terkini.xml";
        return await fetchNews(rssUrl);
      } else if (input.includes("gempa")) {
        return await fetchBmkgEarthquake();
      }
    }

    async function fetchNews(rssUrl) {
      const proxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=";
      try {
        const response = await fetch(proxyUrl + encodeURIComponent(rssUrl));
        if (!response.ok) {
          return "Maaf, saya tidak dapat mengambil berita saat ini.";
        }
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
          return "Maaf, tidak ada berita yang ditemukan.";
        }
        // Take first 2 news items
        const newsItems = data.items.slice(0, 2);
        let newsList = `<div>Berikut ${newsItems.length} berita terbaru:</div>`;

        for (let index = 0; index < newsItems.length; index++) {
          const item = newsItems[index];
          // Remove any <img> tags from description to avoid duplicate images
          let description = item.description || item.contentSnippet || "";
          description = description.replace(/<img[^>]*>/g, "");

          // Show only one image per news item below the title, with max width 90% to avoid exceeding chat column
          let imageHtml = "";
          if (item.enclosure && item.enclosure.link) {
            imageHtml = `<img src="${item.enclosure.link}" alt="news image" style="max-width:90%; height:auto; margin-top:0.5em; border-radius:4px; display:block;" />`;
          }
          newsList += `<div style="margin-bottom:1em; font-family: Arial, sans-serif;">
          <div><strong>${index + 1}. <a href="${
            item.link
          }" target="_blank" rel="noopener noreferrer" style="color:blue; font-family: Arial, sans-serif;">${
            item.title
          }</a></strong></div>
          ${imageHtml}
          <div style="margin-top:0.5rem;  font-size:0.9em; color:#555; font-family: Arial, sans-serif;">${description}</div>
        </div>`;
        }
        return newsList;
      } catch (error) {
        return "Maaf, terjadi kesalahan saat mengambil berita.";
      }
    }

    // Helper function to fetch BMKG real-time earthquake data
    async function fetchBmkgEarthquake() {
      const url = "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json";
      try {
        const response = await fetch(url);
        if (!response.ok) {
          return "Maaf, saya tidak dapat mengambil data gempa bumi terkini dari BMKG saat ini.";
        }
        const data = await response.json();
        const gempa = data.Infogempa.gempa;

        // Extract required fields
        const wilayah = gempa.Wilayah || "";
        const tanggal = gempa.Tanggal || "";
        const jam = gempa.Jam || "";
        const datetime = `${tanggal} ${jam}`;
        const dirasakan = gempa.Dirasakan || "";
        const mmi = gempa.MMI || "";
        const magnitude = gempa.Magnitude || "";
        const kedalaman = gempa.Kedalaman || "";
        const koordinat = gempa.Coordinates || "";
        const lintang = gempa.Lintang || "";
        const bujur = gempa.Bujur || "";

        // const imgUrl = gempa.Shakemap || ""; // Remove image as per user request

        // Compose felt and MMI label combined
        const feltMmiLabel =
          (dirasakan && dirasakan !== "-"
            ? `${dirasakan}`
            : "Tidak ada laporan") + (mmi ? `, Skala MMI: ${mmi}` : "");

        // Compose subtitle with epicenter info, avoid duplicate words
        const subtitle = wilayah ? `${wilayah}` : "";

        // Compose BMKG advice with link
        const saran = ` Ikuti arahan dan peringatan resmi dari BMKG dan pihak berwenang setempat. <a href="https://www.bmkg.go.id/" target="_blank" rel="noopener noreferrer">Situs Resmi BMKG</a>`;

        // Format response HTML without image, normal text (no bold)
        let responseHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 100%;">
          <h3>Gempa Bumi Terkini - BMKG</h3>
          <div><strong>Info:</strong> ${subtitle}</div>
          <div><strong>Tanggal & Waktu:</strong> ${datetime}</div>
          <div><strong>Dirasakan:</strong> ${feltMmiLabel}</div>
          <div><strong>Magnitudo:</strong> ${magnitude}</div>
          <div><strong>Kedalaman:</strong> ${kedalaman}</div>
          <div><strong>Koordinat:</strong> ${koordinat} (<strong>Lintang:</strong> ${lintang}, <strong>Bujur:</strong> ${bujur})</div>
          <div><strong>Saran:</strong>${saran}</div>
        </div>
      `;

        return responseHtml;
      } catch (error) {
        return "Maaf, terjadi kesalahan saat mengambil data gempa bumi terkini dari BMKG.";
      }
    }

    // Comfort and entertain when user is sad or lonely
    const sadKeywords = [
      "sedih",
      "kesepian",
      "galau",
      "kecewa",
      "putus",
      "stress",
      "bosan",
      "marah",
    ];
    for (const word of sadKeywords) {
      if (input.includes(word)) {
        return "Saya mengerti perasaan Anda. Saya bisa memberikan hiburan atau saran. Silakan pilih kategori: jokes, tebakan, quotes, pantun, atau nasihat.";
      }
    }

    // Helper function to get random item from array
    function getRandomItem(arr) {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    const jokes = [
      "Kenapa komputer selalu dingin? Karena dia punya banyak kipas!",
      "Apa yang dilakukan programmer saat lapar? Dia makan 'byte'!",
      "Kenapa robot tidak pernah sakit? Karena dia punya antivirus!",
      "Kenapa programmer suka kopi? Karena mereka butuh 'java'!",
      "Kenapa keyboard tidak pernah lelah? Karena dia punya banyak 'keys'!",
      "Apa yang dilakukan komputer saat bosan? Dia membuka 'windows'!",
      "Kenapa programmer tidak suka hujan? Karena takut 'bug'!",
      "Kenapa komputer suka musik? Karena dia punya 'sound card'!",
      "Kenapa programmer suka matematika? Karena mereka suka 'array'!",
      "Kenapa komputer tidak pernah tidur? Karena dia selalu 'online'!",
    ];

    const riddles = [
      {
        question: "Saya punya kunci tapi tidak punya pintu. Apa saya?",
        answer: "piano",
      },
      { question: "Apa yang bisa terbang tanpa sayap?", answer: "waktu" },
      {
        question: "Apa yang selalu datang tapi tidak pernah tiba?",
        answer: "besok",
      },
      {
        question: "Apa yang memiliki tangan tapi tidak bisa bertepuk?",
        answer: "jam",
      },
      {
        question: "Apa yang bisa pecah tapi tidak pernah jatuh?",
        answer: "fajar",
      },
      {
        question: "Apa yang naik tapi tidak pernah turun?",
        answer: "umur",
      },
      {
        question: "Apa yang memiliki banyak gigi tapi tidak bisa menggigit?",
        answer: "sisir",
      },
      {
        question: "Apa yang selalu basah saat mengeringkan?",
        answer: "handuk",
      },
      {
        question: "Apa yang memiliki kepala dan ekor tapi tidak punya tubuh?",
        answer: "koin",
      },
      {
        question: "Apa yang bisa kamu tangkap tapi tidak bisa dilempar?",
        answer: "flu",
      },
    ];

    const quotes = [
      "Jangan pernah menyerah, karena kegagalan adalah kesuksesan yang tertunda.",
      "Hidup itu seperti mengendarai sepeda, untuk menjaga keseimbangan kamu harus terus bergerak.",
      "Setiap hari adalah kesempatan baru untuk menjadi lebih baik.",
      "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.",
      "Jadilah perubahan yang ingin kamu lihat di dunia.",
      "Kegagalan bukanlah akhir, tapi awal dari sesuatu yang lebih baik.",
      "Keberanian bukanlah ketiadaan rasa takut, tapi kemampuan untuk mengatasinya.",
      "Jangan takut mencoba hal baru, karena itu adalah jalan menuju pertumbuhan.",
      "Hidup adalah perjalanan, nikmati setiap langkahnya.",
      "Percaya pada dirimu sendiri adalah kunci untuk meraih impian.",
    ];

    const pantun = [
      "Burung merpati terbang tinggi,",
      "Membawa pesan penuh arti,",
      "Jangan biarkan hati sendiri,",
      "Karena kamu selalu berarti.",
      "Pagi hari minum kopi,",
      "Sambil duduk di beranda,",
      "Jangan biarkan hati sepi,",
      "Karena kamu berharga adanya.",
      "Bunga mawar harum semerbak,",
      "Mekar indah di taman kota.",
    ];

    const advices = [
      "Cobalah untuk berbicara dengan teman atau keluarga yang kamu percaya.",
      "Luangkan waktu untuk melakukan hal yang kamu sukai.",
      "Ingatlah bahwa perasaan ini akan berlalu, dan kamu tidak sendiri.",
      "Jangan ragu untuk meminta bantuan jika kamu membutuhkannya.",
      "Berolahraga dapat membantu meningkatkan suasana hati.",
      "Cobalah meditasi atau teknik relaksasi untuk menenangkan pikiran.",
      "Tetaplah positif dan fokus pada hal-hal yang membuatmu bahagia.",
      "Luangkan waktu untuk beristirahat dan merawat diri sendiri.",
      "Buatlah daftar hal-hal yang kamu syukuri setiap hari.",
      "Ingat bahwa setiap hari adalah kesempatan baru untuk memulai kembali.",
    ];

    const categories = [
      "jokes",
      "lelucon",
      "candaan",
      "riddles",
      "tebakan",
      "teka-teki",
      "quotes",
      "motivasi",
      "kutipan",
      "pantun",
      "lagu",
      "advices",
      "nasihat",
    ];

    if (categories.includes(input)) {
      if (input === "jokes" || input === "lelucon" || input === "candaan") {
        return getRandomItem(jokes);
      }
      if (input === "riddles" || input === "tebakan" || input === "teka-teki") {
        const riddle = getRandomItem(riddles);
        riddleState.active = true;
        riddleState.currentRiddle = riddle.question;
        riddleState.currentAnswer = riddle.answer;
        riddleState.attempts = 0;
        return `Tebak-tebakan: ${riddle.question}\nSilakan jawab tebakan ini.`;
      }
      if (input === "quotes" || input === "motivasi" || input === "kutipan") {
        return getRandomItem(quotes);
      }
      if (input === "pantun") {
        return getRandomItem(pantun);
      }
      if (input === "advices" || input === "nasihat") {
        return getRandomItem(advices);
      }
    }

    // Handle riddle answer if riddle is active
    if (riddleState.active) {
      riddleState.attempts++;
      if (input === riddleState.currentAnswer) {
        riddleState.active = false;
        riddleState.currentRiddle = null;
        riddleState.currentAnswer = null;
        riddleState.attempts = 0;
        return "Selamat! Jawaban kamu benar. Apakah kamu ingin saya beri tebakan lain atau hal lain yang bisa saya bantu?";
      } else {
        if (riddleState.attempts >= 3) {
          const correctAnswer = riddleState.currentAnswer;
          riddleState.active = false;
          riddleState.currentRiddle = null;
          riddleState.currentAnswer = null;
          riddleState.attempts = 0;
          return `Maaf, jawaban kamu salah. Jawaban yang benar adalah: ${correctAnswer}. Apakah kamu ingin saya beri tebakan lain atau hal lain yang bisa saya bantu?`;
        } else {
          return "Jawaban kamu salah, coba lagi ya!";
        }
      }
    }

    // Detect math operations
    let mathInput = input
      .replace(/tambah|ditambah|plus|\+/g, "+")
      .replace(/kurang|dikurang|minus|minus/g, "-")
      .replace(/kali|dikali|x|times|\*/g, "*")
      .replace(/bagi|dibagi|\/|divided by/g, "/");

    const mathPattern = /^([0-9\s\+\-\*\/\.\(\)]+)$/;
    if (mathPattern.test(mathInput.replace(/\s+/g, ""))) {
      try {
        const result = Function('"use strict";return (' + mathInput + ")")();
        if (typeof result === "number" && !isNaN(result)) {
          // Round math result: round if > 10, else 4 decimals
          const roundedResult =
            Math.abs(result) > 10
              ? Math.round(result)
              : parseFloat(result.toFixed(4));
          return `Hasilnya adalah ${roundedResult}`;
        }
      } catch (e) {}
    }

    // info wikepedia fitur
    const infoCheckKeywords = [
      "apa itu",
      "apa itu yang dimaksud",
      "apa yang dimaksud dengan",
      "apa maksud dari",
      "apa arti",
      "apa penyebab",
      "apa benar yang dimaksud dengan",
      "apa fakta dari",
      "apakah benar",
      "apakah",
      "benarkah",
      "siapa itu",
      "siapa yang",
      "kapan",
      "kapan terjadi",
      "di mana",
      "dimana",
      "di manakah",
      "bagaimana",
      "bagaimana cara",
      "bagaimana terjadinya",
      "kenapa",
      "mengapa",
      "jelaskan tentang",
      "jelaskan",
      "informasi tentang",
      "info tentang",
      "detail mengenai",
      "definisi",
      "pengertian",
      "arti kata",
      "contoh dari",
      "sejarah",
      "asal usul",
      "asal mula",
      "penjelasan tentang",
      "penjelasan",
      "berapa",
      "negara",
    ];

    for (const keyword of infoCheckKeywords) {
      if (input.includes(keyword)) {
        // Extract the fact topic by removing the keyword from input
        let infoTopic = input;
        for (const kw of infoCheckKeywords) {
          infoTopic = infoTopic.replace(kw, "");
        }
        infoTopic = infoTopic.trim();
        if (!infoTopic) {
          return "Silakan ketik topik, pertanyaan, atau pernyataan yang ingin Kamu cari informasinya.";
        }

        // Call infoCheck function and return result
        return await infoCheck(infoTopic);
      }
    }

    async function infoCheck(query) {
      // Use Wikipedia summary API to fetch factual summary
      const apiUrl = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          return `Maaf, saya tidak dapat menemukan informasi terkait "${query}".`;
        }
        const data = await response.json();
        if (data.extract) {
          // Return the extract with a link to Wikipedia page
          return `<div><strong>Informasi dari Wikipedia tentang "${query}":</strong><br>${data.extract}<br><a href="${data.content_urls.desktop.page}" target="_blank" rel="noopener noreferrer">Baca lebih lanjut di Wikipedia</a></div>`;
        } else {
          return `Maaf, saya tidak dapat menemukan informasi terkait  "${query}".`;
        }
      } catch (error) {
        return `Maaf, terjadi kesalahan saat mencari informasi tentang  "${query}". Silakan coba lagi nanti.`;
      }
    }

    if (
      input.includes("hari ini") ||
      input.includes("tanggal hari ini") ||
      input.includes("tanggal sekarang") ||
      input.includes("tanggal") ||
      input.includes("waktu sekarang") ||
      input.includes("jam berapa") ||
      input.includes("pukul berapa") ||
      input.includes("hari apa")
    ) {
      const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
      ];
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];
      const now = new Date();
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const seconds = now.getSeconds().toString().padStart(2, "0");

      if (input.includes("hari apa")) {
        return `Hari ini adalah hari ${dayName}.`;
      }
      if (
        input.includes("tanggal") ||
        input.includes("hari ini") ||
        input.includes("tanggal hari ini") ||
        input.includes("tanggal sekarang")
      ) {
        return `Tanggal hari ini adalah ${date} ${monthName} ${year}.`;
      }
      if (
        input.includes("waktu sekarang") ||
        input.includes("jam berapa") ||
        input.includes("pukul berapa")
      ) {
        return `Waktu sekarang adalah pukul ${hours}:${minutes}:${seconds}.`;
      }
    }



    // Handle weather queries
    if (
      input.includes("cuaca") ||
      input.includes("bagaimana cuaca") ||
      input.includes("cuaca hari ini")
    ) {
      // Return a placeholder while fetching location and weather
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          resolve("Maaf, fitur geolokasi tidak didukung oleh browser Anda.");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            try {
              // Use wttr.in for weather info without API key, request Indonesian language
              const response = await fetch(
                `https://wttr.in/${lat},${lon}?format=%C+%t&lang=id`
              );
              if (!response.ok) {
                resolve(
                  "Maaf, saya tidak dapat mengambil data cuaca saat ini."
                );
                return;
              }
              const weatherText = await response.text();

              // Fetch location name from reverse geocoding API (Nominatim OpenStreetMap)
              let locationName = "";
              try {
                const geoResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
                );
                if (geoResponse.ok) {
                  const geoData = await geoResponse.json();
                  locationName =
                    geoData.address.city ||
                    geoData.address.town ||
                    geoData.address.village ||
                    geoData.address.county ||
                    geoData.address.state ||
                    "";
                }
              } catch (e) {
                // Ignore errors in location name fetching
              }

              // Since wttr.in returns description in Indonesian, no translation needed
              let description = "";
              let temperature = "";
              const match = weatherText.match(/^(.+?)\s+([+\-]?\d+°[CF])$/i);
              if (match) {
                description = match[1].trim();
                temperature = match[2];
              } else {
                description = weatherText.trim();
                temperature = "";
              }

              let locationInfo = locationName ? ` di ${locationName}` : "";
              resolve(
                `Cuaca saat ini${locationInfo} adalah: ${description} ${temperature}`.trim()
              );
            } catch (error) {
              resolve(
                "Maaf, terjadi kesalahan saat mengambil data cuaca. Silakan coba lagi nanti."
              );
            }
          },
          () => {
            resolve(
              "Maaf, saya tidak dapat mengakses lokasi Anda. Mohon izinkan akses lokasi."
            );
          }
        );
      });
    }

    return "Maaf, saya belum bisa menjawab pertanyaan itu dengan tepat. Bisa Anda coba tanya dengan cara lain?";
  };
})();

// DOM elements
const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");

// Function to add message to chat
async function addMessage(text, sender) {
  // Remove existing animation class to reset animation
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", sender);
  // Force reflow to restart animation if needed
  void messageDiv.offsetWidth;
  if (sender === "ai") {
    // Render AI messages as HTML to support links and formatting
    messageDiv.innerHTML = text;
  } else {
    // Render user messages as plain text for safety
    messageDiv.textContent = text;
  }
  chatMessages.appendChild(messageDiv);
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  // Animate message appearance
  await delay(10); // slight delay for animation
  // Removed manual style changes to avoid double animation
  // messageDiv.style.opacity = '1';
  // messageDiv.style.transform = 'translateY(0)';
}

// Function to show AI typing indicator
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.classList.add("typing-indicator");
  typingDiv.setAttribute("aria-label", "AI sedang mengetik");
  typingDiv.setAttribute("role", "status");
  typingDiv.setAttribute("aria-live", "polite");
  typingDiv.innerHTML = "<span></span><span></span><span></span>";
  chatMessages.appendChild(typingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return typingDiv;
}

// Handle form submit
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const inputText = userInput.value.trim();
  if (!inputText) return;

  // Disable input and show spinner on send button
  userInput.disabled = true;
  sendButton.disabled = true;
  sendButton.classList.add("sending");

  // Add user message
  await addMessage(inputText, "user");
  userInput.value = "";

  // Show AI typing indicator
  const typingIndicator = showTypingIndicator();

  // Simulate AI thinking delay
  await delay(300);

  // Remove typing indicator
  typingIndicator.remove();

  // Get AI response
  let response = await aiResponse(inputText);

  // If AI response is empty or null, provide a fallback message
  if (!response || response.trim() === "") {
    response =
      "Maaf, saya belum bisa menjawab pertanyaan itu dengan tepat. Bisa Anda coba tanya dengan cara lain?";
  }

  // Add AI message
  await addMessage(response, "ai");

  // Speak the AI response using speech synthesis with Indonesian male voice
  async function speakText(text) {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported in this browser.");
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Helper to wait for voices to be loaded
    function loadVoices() {
      return new Promise((resolve) => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length) {
          resolve(voices);
          return;
        }
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          resolve(voices);
        };
      });
    }

    const voices = await loadVoices();

    // Find Indonesian male voice
    // Prioritize male voices with lang starting with 'id' (Indonesian)
    let selectedVoice = null;
    for (const voice of voices) {
      if (
        voice.lang.toLowerCase().startsWith("id") &&
        voice.name.toLowerCase().includes("male")
      ) {
        selectedVoice = voice;
        break;
      }
    }
    // If no male voice found, fallback to any Indonesian voice
    if (!selectedVoice) {
      selectedVoice = voices.find((v) => v.lang.toLowerCase().startsWith("id"));
    }
    // If still no voice found, fallback to default voice
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    // Split text into chunks to avoid speech cut-off (max 300 chars)
    const chunkSize = 150;
    const chunks = [];
    let start = 0;

    // Helper function to find last sentence boundary before max length
    function findLastSentenceBoundary(text, maxIndex) {
      const sentenceEndings = [".", "!", "?", ",", ";", ":"];
      let lastBoundary = -1;
      for (const sep of sentenceEndings) {
        const idx = text.lastIndexOf(sep, maxIndex);
        if (idx > lastBoundary) {
          lastBoundary = idx;
        }
      }
      return lastBoundary;
    }

    while (start < text.length) {
      let end = start + chunkSize;
      if (end < text.length) {
        // Try to break at last sentence boundary to avoid cutting sentences
        const lastBoundary = findLastSentenceBoundary(text, end);
        if (lastBoundary > start) {
          end = lastBoundary + 1; // include the punctuation
        } else {
          // fallback to last space if no sentence boundary found
          const lastSpace = text.lastIndexOf(" ", end);
          if (lastSpace > start) {
            end = lastSpace;
          }
        }
      }
      chunks.push(text.substring(start, end).trim());
      start = end;
    }

    // Speak chunks sequentially
    for (const chunk of chunks) {
      await new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.voice = selectedVoice;
        utterance.lang = "id-ID";
        utterance.rate = 1.3; // normal speed
        utterance.pitch = 1.3; // normal pitch
        utterance.onend = resolve;
        utterance.onerror = resolve;
        window.speechSynthesis.speak(utterance);
      });
    }
  }

  // Extract plain text from response (which may contain HTML)
  function extractTextFromHTML(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  const plainTextResponse = extractTextFromHTML(response);
  speakText(plainTextResponse);

  // Re-enable input and remove spinner
  userInput.disabled = false;
  sendButton.disabled = false;
  sendButton.classList.remove("sending");

  // Focus input
  userInput.focus();
});

// Initial greeting message from AI
window.addEventListener("load", () => {
  addMessage(
    "Halo! Saya Askha AI. Silakan tanyakan apa saja, saya siap membantu Kamu dan memberikan jawaban dengan cepat dan efisien.",
    "ai"
  );
});
