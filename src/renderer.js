// Renderer process script
console.log('NiluFlix renderer loaded!');

// Add some interactivity to test everything is working
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            const buttonText = e.target.textContent;
            console.log(`Clicked: ${buttonText}`);
            
            // Visual feedback
            e.target.style.transform = 'scale(0.95)';
            setTimeout(() => {
                e.target.style.transform = 'scale(1)';
            }, 100);
        });
    });

    // Log that everything is working
    console.log('✅ Electron main process running');
    console.log('✅ Renderer process loaded');
    console.log('✅ DOM ready');
    console.log('🚀 Ready to build NiluFlix!');
});
