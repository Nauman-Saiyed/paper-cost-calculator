const PAPER_TYPES = [
    { label: "Select Paper Type", value: "", ratePerKg: 0 },
    { label: "Art Paper", value: "art", ratePerKg: 110 },
    { label: "Duplex Paper ", value: "duplex", ratePerKg: 65 },
    { label: "Kraft Paper ", value: "kraft", ratePerKg: 55 },
    { label: "Ivory Board ", value: "ivory", ratePerKg: 95 },
];

const COLOR_PRICES = [
    { label: "Select Color Type", value: "", colorPrice: 0 },
    { label: "1", value: "1-color", colorPrice: 300 },
    { label: "2", value: "2-colors", colorPrice: 600 },
    { label: "3", value: "3-colors", colorPrice: 900 },
    { label: "4", value: "4-colors", colorPrice: 1200 },
];

const CORRUGATION_TYPES = [
    { label: "Select GSM", value: "", corrugationCharge: 0 },
    { label: "100 GSM", value: "100-gsm", corrugationCharge: 47 },
    { label: "200 GSM", value: "200-gsm", corrugationCharge: 50 },
    { label: "300 GSM", value: "300-gsm", corrugationCharge: 53 },
    { label: "400 GSM", value: "400-gsm", corrugationCharge: 57 },
];

function num(id) {
    const v = $("#" + id).val();
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function formatMoney(n) {
    return (Math.round((n + Number.EPSILON) * 100) / 100).toFixed(2);
}

function setupPaperTypeDropdown() {
    const $old = $("#paper-type");
    if (!$old.length) return;
    if ($old.prop("tagName").toLowerCase() === "select") return;

    const $select = $("<select/>", { id: "paper-type" });
    $.each(PAPER_TYPES, function (_, p) {
        $("<option/>", { value: p.value, text: p.label }).appendTo($select);
    });
    $old.replaceWith($select);
}

function setupColorTypeDropdown() {
    const $old = $("#color-type");
    if (!$old.length) return;
    if ($old.prop("tagName").toLowerCase() === "select") return;

    const $select = $("<select/>", { id: "color-type" });
    $.each(COLOR_PRICES, function (_, p) {
        $("<option/>", { value: p.value, text: p.label }).appendTo($select);
    });
    $old.replaceWith($select);
}

function setupCorrugationChargesDropdown() {
    const $old = $("#corrugation-type");
    if (!$old.length) return;
    if ($old.prop("tagName").toLowerCase() === "select") return;

    const $select = $("<select/>", { id: "corrugation-type" });
    $.each(CORRUGATION_TYPES, function (_, p) {
        $("<option/>", { value: p.value, text: p.label }).appendTo($select);
    });
    $old.replaceWith($select);
}

// ===================== Enquiry Form (jQuery) =====================
function getEnquiry() {
    return {
        name: ($("#user-name").val() || "").trim(),
        companyName: ($("#company-name").val() || "").trim(),
        email: ($("#user-email").val() || "").trim(),
        phone: ($("#user-phone").val() || "").trim(),
    };
}

function validateEnquiry({ name, email, phone }) {
    if (!name) return "Please enter your name.";
    if (!email) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Please enter a valid email.";
    if (!phone) return "Please enter your phone number.";
    if (!/^[0-9+\-\s]{8,15}$/.test(phone)) return "Please enter a valid phone number.";
    return "";
}

// Helper: show/hide an entire result row based on condition
function setResultLine(spanId, value, shouldShow) {
    const $span = $("#" + spanId);
    const $row = $span.closest("p");
    if (!shouldShow) {
        $row.hide();
        return;
    }
    $span.text(formatMoney(value));
    $row.show();
}

// Helper: build quotation cost line only if row is visible
function pushIfVisible(lines, label, spanId) {
    const $span = $("#" + spanId);
    const $row = $span.closest("p");
    if ($row.is(":visible")) {
        lines.push(`${label}: ₹${$span.text()}`);
    }
}

// -------- Quotation helpers (Aligned + PDF friendly) --------

// Safe text + number formatting
function safeText(v, fallback = "N/A") {
    const s = (v ?? "").toString().trim();
    return s ? s : fallback;
}

function money(v) {
    const n = Number(v);
    return Number.isFinite(n) ? formatMoney(n) : "0.00";
}

// Pad helpers for fixed-width alignment
function padRight(str, width) {
    str = String(str);
    return str.length >= width ? str.slice(0, width) : str + " ".repeat(width - str.length);
}
function padLeft(str, width) {
    str = String(str);
    return str.length >= width ? str.slice(0, width) : " ".repeat(width - str.length) + str;
}

// Add row only when amount > 0 (or allow forced show like Paper Cost)
function addCostRow(rows, label, amount, forceShow = false) {
    const n = Number(amount);
    if (forceShow || (Number.isFinite(n) && n > 0)) {
        rows.push({ label, amount: n });
    }
}

// Build a clean aligned quotation (plain text, perfect for preview + PDF)
function buildQuotationText(enquiry) {
    const paperCost = Number($("#totalCost").text()) || 0;
    const plateCost = Number($("#unitCost").text()) || 0;
    const printingCost = Number($("#sellingPrice").text()) || 0;
    const laminationCost = Number($("#laminationCost").text()) || 0;
    const corrugationCost = Number($("#corrugationCost").text()) || 0;

    const totalCost = Number($("#totalCostAll").text()) || 0;
    const perBoxCost = Number($("#perBoxCost").text()) || 0;

    const productName = safeText($("#product-name").val(), "-");
    const brandName = safeText($("#product-brand-name").val(), "-");

    const lines = [];

    // Header
    lines.push("QUOTATION - Paper Cost Calculator");
    lines.push("=".repeat(48));
    lines.push(`Customer Name   : ${safeText(enquiry.name)}`);
    lines.push(`Company Name    : ${safeText(enquiry.companyName)}`);
    lines.push(`Email           : ${safeText(enquiry.email)}`);
    lines.push(`Phone           : ${safeText(enquiry.phone)}`);
    lines.push(`Date            : ${new Date().toLocaleDateString()}`);
    lines.push(`Product         : ${productName}`);
    lines.push(`Brand           : ${brandName}`);
    lines.push("");

    // Inputs section
    lines.push("INPUT DETAILS");
    lines.push("-".repeat(48));
    lines.push(`Ups             : ${$("#ups").val() || 0}`);
    lines.push(`Sheets          : ${$("#sheets").val() || 0}`);
    lines.push(`Paper Size      : ${$("#paper-width").val() || 0} x ${$("#paper-height").val() || 0}`);
    lines.push(`Paper GSM       : ${$("#paper-gsm").val() || 0}`);
    lines.push(`Paper Type      : ${$("#paper-type option:selected").text() || "-"}`);
    lines.push(`Colors          : ${$("#color-type option:selected").text() || "-"}`);
    lines.push(`Wastage %       : ${$("#wastage-percent").val() || 0}`);
    lines.push(`Profit %        : ${$("#marginal-profit-percentage").val() || 0}`);
    lines.push("");

    // Cost table
    const rows = [];
    addCostRow(rows, "Paper Cost", paperCost, true);         // always show paper cost
    addCostRow(rows, "Plate Cost", plateCost);
    addCostRow(rows, "Printing Cost", printingCost);
    addCostRow(rows, "Lamination Cost", laminationCost);
    addCostRow(rows, "Corrugation Cost", corrugationCost);

    const col1 = 28; // label width
    const col2 = 16; // amount width

    lines.push("COST BREAKDOWN");
    lines.push("-".repeat(col1 + col2 + 4));
    lines.push(padRight("Item", col1) + "  " + padLeft("Amount (₹)", col2));
    lines.push("-".repeat(col1 + col2 + 4));

    rows.forEach((r) => {
        lines.push(padRight(r.label, col1) + "  " + padLeft(money(r.amount), col2));
    });

    lines.push("-".repeat(col1 + col2 + 4));
    lines.push(padRight("Total Cost", col1) + "  " + padLeft(money(totalCost), col2));
    lines.push(padRight("Per Box Cost", col1) + "  " + padLeft(money(perBoxCost), col2));
    lines.push("-".repeat(col1 + col2 + 4));

    lines.push("");
    lines.push("Notes:");
    lines.push("1) Rates are subject to change based on final specifications.");
    lines.push("2) This quotation is system generated.");

    return lines.join("\n");
}

// Preview box: use <pre> so alignment stays perfect
function showQuotationPreview(text) {
    let $box = $("#quotation-preview");

    if (!$box.length) {
        $box = $(`
            <pre id="quotation-preview"></pre>
        `);

        $(".form-container").append($box);
    }

    $box.css({
        marginTop: "16px",
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff",
        fontFamily: "Consolas, monospace",
        fontSize: "13px",
        lineHeight: "1.5",
        whiteSpace: "pre-wrap",
        overflowX: "auto"
    });

    $box.text(text);
}

// ---- Main Calculate ----
function calculate() {
    console.log("Calculated Clicked");
    const form = document.getElementById("calculation-form");
    if (form && !form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    const productName = ($("#product-name").val() || "").trim();
    const productBrandName = ($("#product-brand-name").val() || "").trim();

    const ups = num("ups");
    const width = num("paper-width");
    const height = num("paper-height");
    const gsm = num("paper-gsm");
    const sheets = num("sheets");

    const wastagePercent = num("wastage-percent");
    const marginalProfitPercentage = num("marginal-profit-percentage");

    // profit validation
    if (marginalProfitPercentage < 0 || marginalProfitPercentage > 100) {
        alert("Profit percentage must be between 0 and 100");
        return false;
    }

    let boxQuantity = ups * sheets;

    // paper type rate
    const paperTypeValue = $("#paper-type").val() || "";
    const paperType = PAPER_TYPES.find((p) => p.value === paperTypeValue);
    const ratePerKg = paperType ? paperType.ratePerKg : 0;

    const paperPriceInput = num("paper-price");
    const pricePerKg = paperPriceInput > 0 ? paperPriceInput : ratePerKg;

    // paper calculations
    const sheetWeightKg = (width * height * (gsm / 1000) * sheets) / 1550;
    const paperCost = sheetWeightKg * pricePerKg;

    // Plate cost: only if color selected (or user entered plate price manually)
    const colorValue = $("#color-type").val() || "";
    const enteredPlate = num("color-price");
    let plateCost = 0;
    if (colorValue) {
        const selectedColor = COLOR_PRICES.find((c) => c.value === colorValue);
        const defaultPlate = selectedColor ? selectedColor.colorPrice : 0;
        plateCost = enteredPlate > 0 ? enteredPlate : defaultPlate;
    } else {
        // if no color selected, but user still manually typed plate price, allow it
        plateCost = enteredPlate > 0 ? enteredPlate : 0;
    }

    // Printing cost: only if user entered > 0
    const printingCost = num("printing-cost");
    const includePrinting = printingCost > 0;

    // Lamination: only if cost per sheet > 0 and dimensions > 0
    const laminationWidth = num("lamination-width");
    const laminationHeight = num("lamination-height");
    const laminationCostPerSheet = num("lamination-cost-per-sheet");

    let laminationCost = 0;
    const includeLamination = laminationCostPerSheet > 0;
    if (includeLamination) {
        let laminationValue =
            (laminationHeight * laminationWidth) / 100 * laminationCostPerSheet;
        laminationCost = laminationValue * sheets;
    }

    // Corrugation: only if corrugation GSM selected AND charge > 0
    const corrugationTypeValue = $("#corrugation-type").val() || "";
    const corrugation_charge_input = num("corrugation-charge");

    let corrugation_gsm = 0;
    let charge = 0;

    if (corrugationTypeValue) {
        const selectedCorrugation = CORRUGATION_TYPES.find((c) => c.value === corrugationTypeValue);
        corrugation_gsm = selectedCorrugation ? parseInt(selectedCorrugation.value, 10) : 0;
        const defaultCharge = selectedCorrugation ? selectedCorrugation.corrugationCharge : 0;
        charge = corrugation_charge_input > 0 ? corrugation_charge_input : defaultCharge;
    } else {
        // if not selected, treat as not applicable even if someone typed charge
        corrugation_gsm = 0;
        charge = 0;
    }

    let corrugationCost = 0;
    const includeCorrugation = corrugation_gsm > 0 && charge > 0;
    if (includeCorrugation) {
        corrugationCost = (width * height * corrugation_gsm * charge * sheets) / 1550000;
    }

    // Required costs (as per your HTML currently required)
    const punchingCost = num("punch-cutting-cost");
    const deliveryCost = num("delivery-cost");

    // total (only include optional ones if applicable)
    let totalCostAll =
        paperCost +
        plateCost +
        (includePrinting ? printingCost : 0) +
        (includeLamination ? laminationCost : 0) +
        (includeCorrugation ? corrugationCost : 0) +
        punchingCost +
        deliveryCost;

    const profitFactor = 1 + marginalProfitPercentage / 100;
    const totalCostAllWithProfit = totalCostAll * profitFactor;

    const netQty = boxQuantity - (wastagePercent / 100) * boxQuantity;
    const perBoxCost = netQty > 0 ? (totalCostAllWithProfit / netQty) : 0;

    // UI update
    $("#productName").text(productName || "-");
    $("#productBrandName").text(productBrandName || "-");

    // Paper cost always shown
    $("#totalCost").text(formatMoney(paperCost));
    $("#totalCost").closest("p").show();

    // Optional lines: hide entire row if not applicable / 0
    setResultLine("unitCost", plateCost, plateCost > 0);
    setResultLine("sellingPrice", printingCost, includePrinting);
    setResultLine("laminationCost", laminationCost, includeLamination && laminationCost > 0);
    setResultLine("corrugationCost", corrugationCost, includeCorrugation && corrugationCost > 0);

    // Totals always shown
    $("#totalCostAll").text(formatMoney(totalCostAll));
    $("#perBoxCost").text(formatMoney(perBoxCost));

    $(".result-box").show();
    $(".form-container").show();

    $("#generate-quotation").prop("disabled", false);
    $("#send-email").prop("disabled", false);

    return true;
}

// ---- Init (jQuery) ----
$(function () {
    setupPaperTypeDropdown();
    setupColorTypeDropdown();
    setupCorrugationChargesDropdown();

    // auto-fill paper-price from selected type
    $("#paper-type").on("change", function () {
        const selectedValue = $(this).val();
        const selectedPaper = PAPER_TYPES.find((p) => p.value === selectedValue);
        $("#paper-price").val(selectedPaper ? selectedPaper.ratePerKg : "");
    });

    // auto-fill plate price from selected color
    $("#color-type").on("change", function () {
        const selectedValue = $(this).val();
        const selectedColor = COLOR_PRICES.find((p) => p.value === selectedValue);
        $("#color-price").val(selectedColor ? selectedColor.colorPrice : "");
    });

    // auto-fill corrugation charge from selected corrugation GSM
    $("#corrugation-type").on("change", function () {
        const selectedValue = $(this).val();
        const selectedCorrugation = CORRUGATION_TYPES.find((p) => p.value === selectedValue);
        $("#corrugation-charge").val(selectedCorrugation ? selectedCorrugation.corrugationCharge : "");
    });

    // ✅ FIX: submit handler must be on #calculation-form (NOT #calc-form)
    $("#calculation-form").on("submit", function (e) {
        e.preventDefault();
        calculate();
    });

    // Auto-fill lamination size from paper size
    function syncLaminationSize() {
        const w = $("#paper-width").val();
        const h = $("#paper-height").val();
        $("#lamination-width").val(w);
        $("#lamination-height").val(h);
    }
    $("#paper-width, #paper-height").on("input change", syncLaminationSize);
    syncLaminationSize();

    // Hide results + enquiry form when calculation inputs change
    $(".calc-container").on("input change", "input, select", function () {
        $(".result-box").hide();
        $(".form-container").hide();
        $("#generate-quotation").prop("disabled", true);
        $("#send-email").prop("disabled", true);
    });

    // Button 1: Generate Quotation
    $("#generate-quotation").on("click", function () {
        const enquiry = getEnquiry();
        const err = validateEnquiry(enquiry);
        if (err) return alert(err);

        const ok = calculate();
        if (!ok) return;

        const quoteText = buildQuotationText(enquiry);
        showQuotationPreview(quoteText);
    });

    // Button 2: Send Email (frontend mailto)
    $("#send-email").on("click", function () {
        const enquiry = getEnquiry();
        const err = validateEnquiry(enquiry);
        if (err) return alert(err);

        const ok = calculate();
        if (!ok) return;

        const quoteText = buildQuotationText(enquiry);

        const to = "yourbusiness@email.com";
        const subject = encodeURIComponent(`Quotation Request - ${enquiry.name}`);
        const body = encodeURIComponent(quoteText);

        window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
});
