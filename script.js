async function buildAndDownload() {
    const btn = document.getElementById("main-btn");
    const status = document.getElementById("status-msg");
    const printTarget = document.getElementById("cv-print-target");

    const data = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value,
        location: document.getElementById("location").value,
        education: document.getElementById("education").value,
        experience: document.getElementById("experience").value,
        skills: document.getElementById("skills").value,
        projects: document.getElementById("projects").value,
        language: document.getElementById("language").value,
    };

    if (!data.name) return alert("Name is required!");

    btn.disabled = true;
    status.innerText = "Designing your one-page CV...";

    try {
        const res = await fetch("https://auto-cv-app.onrender.com/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        
        // Reset scroll and inject HTML
        window.scrollTo(0, 0);
        printTarget.innerHTML = result.cv.html;

        status.innerText = "Generating PDF...";

        setTimeout(() => {
            const opt = {
                margin: 0,
                filename: `${data.name}_CV.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 3, 
                    useCORS: true,
                    backgroundColor: "#ffffff",
                    scrollY: 0
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(printTarget).save().then(() => {
                status.innerText = "Download complete!";
                btn.disabled = false;
                setTimeout(() => status.innerText = "", 3000);
            });
        }, 1000);

    } catch (err) {
        console.error(err);
        status.innerText = "Connection failed.";
        btn.disabled = false;
    }
}
