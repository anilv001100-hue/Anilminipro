document.addEventListener("DOMContentLoaded", () => {
  const docText = document.getElementById("doc-text");
  const analyzeBtn = document.getElementById("analyze-btn");
  const resultContainer = document.getElementById("result-container");
  
  const scoreValue = document.getElementById("score-value");
  const scoreCircle = document.getElementById("score-circle");
  const scoreVerdict = document.getElementById("score-verdict");
  
  const redFlagsList = document.getElementById("red-flags-list");
  const plainSummary = document.getElementById("plain-summary");
  const checklist = document.getElementById("checklist");

  const btnRisky = document.getElementById("sample-risky");
  const btnSafe = document.getElementById("sample-safe");

  // Sample texts matching case study scenarios
  const riskySample = `Clause 14.2: The lender reserves the right to increase annual percentage rates (APR) up to 36% at sole discretion without written notice.
Clause 19: Late fees include a flat penalty of ₹2,500 plus 2% compounded daily on overdue balance.
Clause 22: This loan includes automatic renewal of optional credit insurance policies billed quarterly unless opted out via physical notice 45 days in advance.`;

  const safeSample = `Clause 4: Fixed interest rate of 10.5% per annum for the entire loan tenure. No unilateral rate revision is permissible.
Clause 7: Late payment fee is capped at 0.5% per month of the overdue EMI.
Clause 11: No optional insurance is bundled. No automatic renewal clauses apply.`;

  btnRisky.addEventListener("click", () => {
    docText.value = riskySample;
  });

  btnSafe.addEventListener("click", () => {
    docText.value = safeSample;
  });

  analyzeBtn.addEventListener("click", () => {
    const text = docText.value.trim();

    if (!text) {
      alert("Please paste text or select a sample first!");
      return;
    }

    analyzeBtn.innerText = "Extracting & Analyzing with AI...";
    analyzeBtn.disabled = true;

    // Simulate AI processing delay
    setTimeout(() => {
      let riskScore = 20;
      let flags = [];
      let questions = [];
      let summaryText = "";

      const lower = text.toLowerCase();

      // Simple keyword heuristic simulating AI analysis
      if (lower.includes("sole discretion") || lower.includes("without written notice") || lower.includes("36%")) {
        riskScore += 35;
        flags.push("Unilateral interest rate bump clause detected (Lender can hike rates without prior notice).");
        questions.push("Is there a legal cap on the maximum floating interest rate?");
      }

      if (lower.includes("daily") || lower.includes("compounded") || lower.includes("flat penalty")) {
        riskScore += 25;
        flags.push("Aggressive compounding late payment penalties identified.");
        questions.push("Can the daily penalty clause be waived or capped according to RBI guidelines?");
      }

      if (lower.includes("automatic renewal") || lower.includes("opted out") || lower.includes("bundled")) {
        riskScore += 20;
        flags.push("Silent auto-renewal trap detected for credit insurance.");
        questions.push("Can I opt out of the insurance package immediately without penalties?");
      }

      if (flags.length === 0) {
        riskScore = 15;
        flags.push("No severe predatory clauses found. Document adheres to standard fair practice.");
        questions.push("What are the exact prepayment / foreclosure charges, if any?");
        summaryText = "Yeh document fair aur transparent lag raha hai. Interest rate aur charges clearly stated hain.";
      } else {
        summaryText = "Is agreement me hidden charges aur aggressive rate revision clauses hain jo aage chal kar debt trap ban sakte hain. Signed copy lene se pehle clarification zaroor lein.";
      }

      // Display results
      resultContainer.style.display = "block";
      scoreValue.innerText = riskScore;

      // Color coding score
      if (riskScore >= 60) {
        scoreCircle.style.background = "#dc2626"; // High Risk Red
        scoreVerdict.innerText = "High Risk Document (Predatory Terms Detected)";
        scoreVerdict.style.color = "#dc2626";
      } else if (riskScore >= 35) {
        scoreCircle.style.background = "#d97706"; // Medium Risk Orange
        scoreVerdict.innerText = "Moderate Risk (Verify Terms Carefully)";
        scoreVerdict.style.color = "#d97706";
      } else {
        scoreCircle.style.background = "#16a34a"; // Safe Green
        scoreVerdict.innerText = "Low Risk / Safe Document";
        scoreVerdict.style.color = "#16a34a";
      }

      // Populate flags
      redFlagsList.innerHTML = flags.map(item => `<li>${item}</li>`).join("");

      // Populate summary
      plainSummary.innerText = summaryText;

      // Populate checklist
      checklist.innerHTML = questions.map(q => `<li>Ask: "${q}"</li>`).join("");

      analyzeBtn.innerText = "Analyze Document with AI";
      analyzeBtn.disabled = false;

      // Scroll to result smoothly
      resultContainer.scrollIntoView({ behavior: 'smooth' });
    }, 700);
  });
});
