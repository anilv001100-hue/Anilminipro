document.addEventListener("DOMContentLoaded", () => {
  const docText = document.getElementById("doc-text");
  const analyzeBtn = document.getElementById("analyze-btn");
  const resultContainer = document.getElementById("result-container");

  const scoreValue = document.getElementById("score-value");
  const gaugeProgress = document.getElementById("gauge-progress");
  const scoreVerdict = document.getElementById("score-verdict");
  const scoreDesc = document.getElementById("score-desc");

  const highlightedText = document.getElementById("highlighted-text");
  const redFlagsList = document.getElementById("red-flags-list");
  const plainSummary = document.getElementById("plain-summary");
  const checklistBox = document.getElementById("checklist-box");

  const btnRisky = document.getElementById("sample-risky");
  const btnSafe = document.getElementById("sample-safe");
  const btnClear = document.getElementById("clear-btn");

  const docFileInput = document.getElementById("doc-file");
  const uploadTrigger = document.getElementById("upload-trigger");
  const fileNameDisplay = document.getElementById("file-name");
  const ocrLoader = document.getElementById("ocr-loader");

  const listenBtn = document.getElementById("listen-btn");
  const langButtons = document.querySelectorAll(".lang-btn");

  const negotiateBtn = document.getElementById("negotiate-btn");
  const negotiationBox = document.getElementById("negotiation-box");
  const negotiationContent = document.getElementById("negotiation-content");

  // Auth Modal Elements
  const openAuthBtn = document.getElementById("open-auth-btn");
  const closeAuthBtn = document.getElementById("close-auth-btn");
  const authModal = document.getElementById("auth-modal");
  const modalCard = document.getElementById("modal-card");
  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  // Calculator Elements
  const calcAmount = document.getElementById("calc-amount");
  const calcRate = document.getElementById("calc-rate");
  const calcTenure = document.getElementById("calc-tenure");
  const calcBump = document.getElementById("calc-bump");
  const calcBtn = document.getElementById("calc-btn");
  const calcStdEmi = document.getElementById("calc-std-emi");
  const calcPredEmi = document.getElementById("calc-pred-emi");
  const calcExtraLoss = document.getElementById("calc-extra-loss");

  let currentTranslations = {
    hinglish: "",
    english: "",
    hindi: ""
  };

  const riskySample = `Clause 14.2: The lender reserves the absolute right to unilaterally adjust annual percentage rates (APR) up to 36% per annum at its sole discretion without prior written notice to the borrower.
Clause 19: Default late payment will incur an instant penalty of ₹2,500 along with 2.5% compounded daily on the total delinquent balance.
Clause 22: Mandatory credit-protection insurance of ₹4,200 annually is auto-renewed unless opted out via physical notice delivered 45 days prior to anniversary.`;

  const safeSample = `Clause 4: Fixed interest rate capped at 9.8% per annum for the entire agreed loan tenure. No unilateral rate revision is permissible without written borrower consent.
Clause 7: Late payment fee is strictly capped at 0.5% per month of overdue installment, compliant with fair-practice guidelines.
Clause 11: All third-party insurance products are optional. No auto-enrollment or silent renewals apply.`;

  btnRisky.addEventListener("click", () => {
    docText.value = riskySample;
    fileNameDisplay.innerText = "sample_predatory_loan.pdf";
  });

  btnSafe.addEventListener("click", () => {
    docText.value = safeSample;
    fileNameDisplay.innerText = "sample_fair_terms.pdf";
  });

  btnClear.addEventListener("click", () => {
    docText.value = "";
    fileNameDisplay.innerText = "";
    resultContainer.style.display = "none";
    negotiationBox.style.display = "none";
    window.speechSynthesis.cancel();
  });

  // Simulated OCR Ingestion
  uploadTrigger.addEventListener("click", () => docFileInput.click());

  docFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fileNameDisplay.innerText = file.name;
    ocrLoader.style.display = "flex";
    analyzeBtn.disabled = true;

    setTimeout(() => {
      ocrLoader.style.display = "none";
      analyzeBtn.disabled = false;
      docText.value = `[OCR PARSED: ${file.name}]\nClause 9.1: Processing fee of ₹5,500 is non-refundable regardless of sanction status.\nClause 15: Lender holds sole discretion to hike interest rate without written notice upon benchmark shifts.\nClause 21: Late payment carries penalty compounded daily at 2%.`;
    }, 1100);
  });

  // Analyzer Processing
  analyzeBtn.addEventListener("click", () => {
    const text = docText.value.trim();

    if (!text) {
      alert("Please paste contract text or select a preset sample first!");
      return;
    }

    analyzeBtn.innerText = "Extracting & Analyzing with AI...";
    analyzeBtn.disabled = true;

    setTimeout(() => {
      let riskScore = 15;
      let flags = [];
      let questions = [];
      let formattedHtml = text;

      const lower = text.toLowerCase();

      if (lower.includes("sole discretion") || lower.includes("without prior written notice") || lower.includes("without written notice") || lower.includes("36%")) {
        riskScore += 35;
        flags.push("Unilateral Interest Adjustment: Lender reserves right to hike interest without advance borrower notice.");
        questions.push("What is the legal maximum floating ceiling on this loan's interest rate?");
        formattedHtml = highlightPhrase(formattedHtml, "sole discretion");
        formattedHtml = highlightPhrase(formattedHtml, "without written notice");
        formattedHtml = highlightPhrase(formattedHtml, "without prior written notice");
        formattedHtml = highlightPhrase(formattedHtml, "36%");
      }

      if (lower.includes("daily") || lower.includes("compounded daily") || lower.includes("flat penalty")) {
        riskScore += 25;
        flags.push("Aggressive Compounding Penalty: Fines accumulate daily, creating compounding debt traps.");
        questions.push("Can default penalties be capped on a monthly basis in accordance with RBI fair practices?");
        formattedHtml = highlightPhrase(formattedHtml, "compounded daily");
        formattedHtml = highlightPhrase(formattedHtml, "flat penalty");
      }

      if (lower.includes("auto-renew") || lower.includes("mandatory credit-protection") || lower.includes("physical notice")) {
        riskScore += 20;
        flags.push("Silent Auto-Renewal Trap: Non-negotiated insurance policies renewed automatically.");
        questions.push("Can I opt out of bundled credit insurance immediately without loan cancellation?");
        formattedHtml = highlightPhrase(formattedHtml, "auto-renewed");
        formattedHtml = highlightPhrase(formattedHtml, "mandatory credit-protection");
      }

      if (lower.includes("non-refundable") || lower.includes("foreclosure charges")) {
        riskScore += 15;
        flags.push("Steep Pre-closure / Processing Fee: High upfront financial deduction regardless of sanction.");
        questions.push("Is there a penalty-free prepayment or foreclosure window?");
        formattedHtml = highlightPhrase(formattedHtml, "non-refundable");
      }

      if (flags.length === 0) {
        riskScore = 12;
        flags.push("No predatory clauses found. Document adheres to standard fair-lending practices.");
        questions.push("Confirm the final EMI schedule and formal amortization sheet before signing.");

        currentTranslations.hinglish = "Yeh agreement safe aur transparent lag raha hai. Isme koi unannounced rate hike ya hidden insurance charges nahi mile.";
        currentTranslations.english = "This agreement appears fair and transparent. No predatory rate hikes or deceptive clauses were identified.";
        currentTranslations.hindi = "यह दस्तावेज़ सुरक्षित और पारदर्शी प्रतीत होता है। इसमें कोई अनुचित ब्याज वृद्धि या छिपा हुआ शुल्क नहीं पाया गया है।";

        negotiationContent.innerText = "Officer Script: 'I have reviewed the agreement. The terms comply with standard practices. Kindly provide the finalized amortization schedule.'";
      } else {
        currentTranslations.hinglish = "Is agreement me hidden penalties aur discretionary interest hike jaise red flags hain. Sign karne se pehle checklist ke sawal loan officer se zaroor poochein.";
        currentTranslations.english = "This agreement contains high-risk clauses including discretionary interest adjustments and daily penalties. Seek written clarification on flagged terms before signing.";
        currentTranslations.hindi = "इस दस्तावेज़ में छिपे हुए शुल्क और एकतरफा ब्याज वृद्धि जैसे गंभीर जोखिम मौजूद हैं। हस्ताक्षर करने से पूर्व बैंक अधिकारी से पुष्टि करें।";

        negotiationContent.innerText = "Officer Script: 'Sir, Clause 14 & 19 mention discretionary rate adjustments and daily compounding penalties. As per RBI Fair Practices, I request capping late fees on a monthly basis and tying floating rates to an external benchmark.'";
      }

      resultContainer.style.display = "block";
      scoreValue.innerText = riskScore;
      highlightedText.innerHTML = formattedHtml;

      const circumference = 264;
      const offset = circumference - (riskScore / 100) * circumference;
      gaugeProgress.style.strokeDashoffset = offset;

      if (riskScore >= 60) {
        gaugeProgress.style.stroke = "#ef4444";
        scoreVerdict.innerText = "High Risk (Predatory Terms Detected)";
        scoreVerdict.style.color = "#dc2626";
        scoreDesc.innerText = "Document contains arbitrary lender rights and predatory penalty structures.";
      } else if (riskScore >= 35) {
        gaugeProgress.style.stroke = "#f59e0b";
        scoreVerdict.innerText = "Moderate Risk (Review Required)";
        scoreVerdict.style.color = "#d97706";
        scoreDesc.innerText = "Some ambiguous clauses require explicit clarification before signing.";
      } else {
        gaugeProgress.style.stroke = "#10b981";
        scoreVerdict.innerText = "Low Risk / Standard Terms";
        scoreVerdict.style.color = "#16a34a";
        scoreDesc.innerText = "Document adheres to standard transparent lending disclosures.";
      }

      redFlagsList.innerHTML = flags.map(item => `<li>⚠️ ${item}</li>`).join("");

      plainSummary.innerText = currentTranslations.hinglish;
      setActiveLang("hinglish");

      checklistBox.innerHTML = questions.map((q, idx) => `
        <label class="checklist-item">
          <input type="checkbox" id="check-${idx}">
          <span>Ask Officer: "${q}"</span>
        </label>
      `).join("");

      document.querySelectorAll(".checklist-item input").forEach(box => {
        box.addEventListener("change", (e) => {
          e.target.parentElement.classList.toggle("checked", e.target.checked);
        });
      });

      analyzeBtn.innerText = "Analyze Document with AI";
      analyzeBtn.disabled = false;
      resultContainer.scrollIntoView({ behavior: "smooth" });
    }, 700);
  });

  function highlightPhrase(content, phrase) {
    const regex = new RegExp(`(${phrase})`, "gi");
    return content.replace(regex, `<mark class="highlight-flag">$1</mark>`);
  }

  function setActiveLang(lang) {
    langButtons.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const selected = btn.getAttribute("data-lang");
      setActiveLang(selected);
      plainSummary.innerText = currentTranslations[selected] || currentTranslations.hinglish;
    });
  });

  listenBtn.addEventListener("click", () => {
    if (!('speechSynthesis' in window)) {
      alert("Voice speech synthesis is not supported on this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const textToRead = plainSummary.innerText;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  });

  negotiateBtn.addEventListener("click", () => {
    if (negotiationBox.style.display === "none") {
      negotiationBox.style.display = "block";
      negotiateBtn.innerText = "Hide Script";
    } else {
      negotiationBox.style.display = "none";
      negotiateBtn.innerText = "Draft Discussion Script";
    }
  });

  // 3D Tilt for Cards and Modal
  function apply3DTilt(element, maxTilt = 12) {
    element.addEventListener("mousemove", (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      element.style.transform = `perspective(1000px) rotateX(${-y / maxTilt}deg) rotateY(${x / maxTilt}deg) translateY(-4px)`;
    });
    element.addEventListener("mouseleave", () => {
      element.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  }

  document.querySelectorAll(".tilt-card").forEach(card => apply3DTilt(card, 15));
  if (modalCard) apply3DTilt(modalCard, 20);

  // 3D Tilt Touch for Nav Items
  const navLinks = document.querySelectorAll(".navbar nav a:not(.nav-cta)");
  navLinks.forEach((link) => {
    link.addEventListener("mousemove", (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = `perspective(600px) rotateX(${-y / 3}deg) rotateY(${x / 3}deg) translateY(-4px) translateZ(14px)`;
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = `perspective(600px) rotateX(0deg) rotateY(0deg) translateY(0px) translateZ(0px)`;
    });
  });

  // EMI Calculator
  function calculateLoanImpact() {
    const P = parseFloat(calcAmount.value) || 0;
    const rStandard = (parseFloat(calcRate.value) || 0) / 12 / 100;
    const n = (parseFloat(calcTenure.value) || 0) * 12;
    const bump = (parseFloat(calcBump.value) || 0) / 12 / 100;

    if (P <= 0 || n <= 0) return;

    const emiStd = (P * rStandard * Math.pow(1 + rStandard, n)) / (Math.pow(1 + rStandard, n) - 1);
    const rBumped = rStandard + bump;
    const emiBumped = (P * rBumped * Math.pow(1 + rBumped, n)) / (Math.pow(1 + rBumped, n) - 1);

    const totalStd = emiStd * n;
    const totalBumped = emiBumped * n;
    const extraLoss = totalBumped - totalStd;

    calcStdEmi.innerText = `₹${Math.round(emiStd).toLocaleString("en-IN")} / mo`;
    calcPredEmi.innerText = `₹${Math.round(emiBumped).toLocaleString("en-IN")} / mo`;
    calcExtraLoss.innerText = `+₹${Math.round(extraLoss).toLocaleString("en-IN")} Total`;
  }

  calcBtn.addEventListener("click", calculateLoanImpact);

  // Auth Modal Handler
  openAuthBtn.addEventListener("click", () => {
    authModal.classList.add("active");
  });

  closeAuthBtn.addEventListener("click", () => {
    authModal.classList.remove("active");
  });

  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) authModal.classList.remove("active");
  });

  tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    loginForm.style.display = "block";
    signupForm.style.display = "none";
  });

  tabSignup.addEventListener("click", () => {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    loginForm.style.display = "none";
    signupForm.style.display = "block";
  });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Firebase Auth Simulation: Successfully logged in!");
    authModal.classList.remove("active");
    openAuthBtn.innerText = "Account: Active";
  });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Firebase Auth Simulation: XYZ account registered successfully!");
    authModal.classList.remove("active");
    openAuthBtn.innerText = "Account: Active";
  });
});
