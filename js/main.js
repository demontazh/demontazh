// 1. Маска на телефон (твоя база)
const phoneInput = document.getElementById('phone');
const maskOptions = { mask: '+{380} (00) 000-00-00' };
const mask = IMask(phoneInput, maskOptions);

// 2. Конфиг (Замени GOOGLE_URL на свой URL веб-приложения!)
const TOKEN = "8407769232:AAERN_dy5DGay1S0P7LEZf4B_VcMLxlQ4Is"; 
const CHAT_ID = "-1003688361287";
const TG_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbydtlIXYY0rE9Lw5eXDJCMWD5gqwHdvypzLzS__ZmYYf0bACIFuNEnTmsJ7ogF0O1Ju/exec"; 

// 3. Обработка формы
document.getElementById('tg-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btn-send');
    btn.innerText = "Отправляю...";
    btn.disabled = true;

    if (!mask.masked.isComplete) {
        Swal.fire('Ошибка', 'Введите номер телефона полностью!', 'error');
        btn.disabled = false;
        btn.innerText = "Отправить";
        return;
    }

    const unmaskedPhone = mask.unmaskedValue;
    const userName = this.name.value;
    const userService = this.service.value;

    // Формируем текст для ТГ
    let message = `<b>🏗 Новая заявка!</b>\n`;
    message += `<b>Имя:</b> ${userName}\n`;
    message += `<b>Телефон:</b> +${unmaskedPhone}\n`;
    message += `<b>Услуга:</b> ${userService}`;

    try {
        // --- ОТПРАВКА В TELEGRAM ---
        const tgPromise = fetch(TG_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                parse_mode: 'html',
                text: message
            })
        });

        // --- ОТПРАВКА В GOOGLE SHEETS ---
        // Используем URLSearchParams для совместимости с Google Apps Script
        const formData = new URLSearchParams();
        formData.append('name', userName);
        formData.append('phone', '+' + unmaskedPhone);
        formData.append('service', userService);

        const googlePromise = fetch(GOOGLE_URL, {
            method: 'POST',
            mode: 'no-cors', // Важно для Google
            body: formData
        });

        // Ждем выполнения обоих запросов
        const [tgResponse] = await Promise.all([tgPromise, googlePromise]);

        if (tgResponse.ok) {
            await Swal.fire({
                title: 'Успех!',
                text: 'Заявка принята. Папа уже выезжает (шутка, скоро перезвонит)',
                icon: 'success',
                confirmButtonColor: '#FFB800'
            });

            this.reset(); 
            mask.value = ''; 
            mask.updateValue(); 
        } else {
            throw new Error('Ошибка Telegram API');
        }

    } catch (err) {
        console.error(err);
        Swal.fire('Упс!', 'Ошибка отправки. Позвоните нам напрямую!', 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = "Отправить";
    }
});