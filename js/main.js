const phoneInput = document.getElementById('phone');
const mask = IMask(phoneInput, { mask: '+{380} (00) 000-00-00' });

const WORKER_URL = "https://sweet-recipe-faa7.p87717891.workers.dev";
const GOOGLE_URL = "https://script.google.com/macros/s/AKfycbydtlIXYY0rE9Lw5eXDJCMWD5gqwHdvypzLzS__ZmYYf0bACIFuNEnTmsJ7ogF0O1Ju/exec";

document.getElementById('tg-form').addEventListener('submit', async function(e) {
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
            iconColor: '#e74c3c',
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

    try {
        const tgPromise = fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: userName,
                phone: '+' + unmaskedPhone,
                service: userService,
                material: this.material.value,
                call_time: this.call_time.value
            })
        });

        const formData = new URLSearchParams({
            name: userName,
            phone: '+' + unmaskedPhone,
            service: userService
        });

        const googlePromise = fetch(GOOGLE_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });

        const [tgResponse] = await Promise.all([tgPromise, googlePromise]);

        if (tgResponse.ok) {
            await Swal.fire({
                title: 'ГОТОВО!',
                text: 'Ваша заявка прийнята',
                icon: 'success',
                background: '#242424',
                color: '#fff',
                iconColor: '#ffb800',
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
            throw new Error('Помилка Worker');
        }

    } catch (err) {
        console.error(err);
        Swal.fire({
            title: 'ПОМИЛКА!',
            text: 'Щось пішло не так. Спробуйте ще раз або зателефонуйте нам.',
            icon: 'error',
            background: '#242424',
            color: '#fff',
            iconColor: '#e74c3c',
            confirmButtonColor: '#333',
            confirmButtonText: 'ЗАКРИТИ'
        });
    } finally {
        btn.disabled = false;
        btn.innerText = "Відправити";
    }
});

AOS.init({ duration: 800, once: true });

new Swiper(".mySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: { 
        rotate: 50, 
        stretch: 0, 
        depth: 100, 
        modifier: 1, 
        slideShadows: true 
    },
    loop: true,
    
    // Вмикаємо ліниве завантаження
    lazy: true,
    preloadImages: false, // Вимикаємо стандартне завантаження всіх картинок
    watchSlidesProgress: true, // Потрібно для коректної роботи lazy з ефектами

    autoplay: { delay: 3000, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { 
        nextEl: ".swiper-button-next", 
        prevEl: ".swiper-button-prev" 
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const choicesConfig = { searchEnabled: false, itemSelectText: '', shouldSort: false };
    new Choices('#select-service', choicesConfig);
    new Choices('#select-material', choicesConfig);
});