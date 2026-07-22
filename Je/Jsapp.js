async function switchPage(pageName) {
    try {
        const response = await fetch(`views/${pageName}.html`);
        if (!response.ok) throw new Error("Introuvable");
        document.getElementById('app-view').innerHTML = await response.text();
    } catch (err) {
        console.error(err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    switchPage('recettes');
});
