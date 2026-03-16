// 1. Маска на телефон (твоя база)
const phoneInput = document.getElementById('phone');
const maskOptions = {
    mask: '+{380} (00) 000-00-00'
};
const mask = IMask(phoneInput, maskOptions);

// 2. Конфиг (Замени GOOGLE_URL на свой URL веб-приложения!)
const TOKEN = "8407769232:AAERN_dy5DGay1S0P7LEZf4B_VcMLxlQ4Is";
const CHAT_ID = "-1003688361287";
const TG_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbydtlIXYY0rE9Lw5eXDJCMWD5gqwHdvypzLzS__ZmYYf0bACIFuNEnTmsJ7ogF0O1Ju/exec";

// 3. Обработка формы
document.getElementById('tg-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('btn-send');
    btn.innerText = "Відправка...";
    btn.disabled = true;

    if (!mask.masked.isComplete) {
        Swal.fire({
            title: 'ПОМИЛКА!',
            text: 'Введіть номер телефона правильно.',
            icon: 'error',
            background: '#242424',
            color: '#fff',
            iconColor: '#e74c3c', // Оставим красный для ошибки, так понятнее
            confirmButtonColor: '#333',
            confirmButtonText: 'ЗАКРИТИ'
        });
        btn.disabled = false;
        btn.innerText = "Відправити";
        return;
    }

    const unmaskedPhone = mask.unmaskedValue;
    const userName = this.name.value;
    const userService = this.service.value;

    // Формируем текст для ТГ
    let message = `<b>🏗 Нова заявка!</b>\n`;
    message += `<b>Ім'я:</b> ${userName}\n`;
    message += `<b>Телефон:</b> +${unmaskedPhone}\n`;
    message += `<b>Послуга:</b> ${userService}\n`;
    message += `<b>Матеріал:</b> ${this.material.value}\n`; // Новое поле
    message += `<b>Час дзвінка:</b> ${this.call_time.value}`; // Новое поле

    try {
        // --- ОТПРАВКА В TELEGRAM ---
        const tgPromise = fetch(TG_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
                title: 'ГОТОВО!',
                text: 'Ваша заявка прийнята',
                icon: 'success',
                background: '#242424', // Наш графит
                color: '#fff',         // Белый текст
                iconColor: '#ffb800',  // Желтая иконка
                confirmButtonColor: '#ffb800',
                confirmButtonText: 'ЗРОЗУМІЛО',
                customClass: {
                    popup: 'my-swal-popup',
                    confirmButton: 'my-swal-button'
                }
            });

            this.reset();
            mask.value = '';
            mask.updateValue();
        } else {
            throw new Error('Ошибка Telegram API');
        }

    } catch (err) {
        console.error(err);
        Swal.fire({
            title: 'ПОМИЛКА!',
            text: 'Щось пішло не так. Спробуйте ще раз або зателефонуйте нам.',
            icon: 'error',
            background: '#242424',
            color: '#fff',
            iconColor: '#e74c3c', // Оставим красный для ошибки, так понятнее
            confirmButtonColor: '#333',
            confirmButtonText: 'ЗАКРИТИ'
        });
    } finally {
        btn.disabled = false;
        btn.innerText = "Відправити";
    }
});

AOS.init({
    duration: 800, // Скорость анимации
    once: true, // Анимировать только один раз при первом скролле
});

// Инициализация Swiper
const swiper = new Swiper(".mySwiper", {
    effect: "coverflow", // Крутой эффект 3D
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
        rotate: 50,
        stretch: 0,
        depth: 100,
        modifier: 1,
        slideShadows: true,
    },
    loop: true, // Зацикленность
    autoplay: {
        delay: 3000, // Листает сам каждые 3 секунды
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
});

document.addEventListener('DOMContentLoaded', function () {
    const selectConfig = {
        searchEnabled: false, // Отключаем поиск, у нас мало пунктов
        itemSelectText: '', // Убираем лишний текст "Press to select"
        shouldSort: false,
    };

    new Choices('#select-service', selectConfig);
    new Choices('#select-material', selectConfig);
    new Choices('#select-service', {
        searchEnabled: false,
        itemSelectText: '', // Убираем лишний текст
        shouldSort: false
    });
});

window.addEventListener('scroll', function() {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.classList.add('header-compact');
    } else {
        header.classList.remove('header-compact');
    }
});