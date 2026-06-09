(function() {
    const body = document.body;
    const darkToggle = document.getElementById('darkToggle');
    const mainContent = document.getElementById('mainContent');
    const toastEl = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');

    const views = {
        homeView: document.getElementById('homeView'),
        loginView: document.getElementById('loginView'),
        registerView: document.getElementById('registerView'),
        testView: document.getElementById('testView'),
        profileView: document.getElementById('profileView'),
    };

    const navHome = document.getElementById('navHome');
    const navLogin = document.getElementById('navLogin');
    const navRegister = document.getElementById('navRegister');
    const navTest = document.getElementById('navTest');
    const navProfile = document.getElementById('navProfile');
    const navLoginItem = document.getElementById('navLoginItem');
    const navRegisterItem = document.getElementById('navRegisterItem');
    const navTestItem = document.getElementById('navTestItem');
    const navProfileItem = document.getElementById('navProfileItem');
    const navUserBadge = document.getElementById('navUserBadge');
    const navUsernameDisplay = document.getElementById('navUsernameDisplay');
    const navLogoutBtn = document.getElementById('navLogoutBtn');
    const homeCTA = document.getElementById('homeCTA');
    const homeLoggedInCTA = document.getElementById('homeLoggedInCTA');

    const DEFAULT_USERS = [{
        name: 'Onur Turacı',
        email: 'onur.turaci@example.com',
        password: 'onur123',
        grade: '3. Sınıf',
        preferences: ['arabalar', 'hayvanlar'],
        stats: {
            totalPoints: 120,
            testsCompleted: 3,
            correctAnswers: 15,
            totalQuestions: 20,
            accuracy: 75,
        },
        badges: ['İlk Test', '5 Doğru', 'Matematik Ustası'],
        apiKey: '',
        lastTest: {
            date: '2026-06-07',
            score: 4,
            total: 5,
            pointsEarned: 80,
        },
        completedTests: [
            { date: '2026-05-20', score: 3, total: 5, pointsEarned: 60 },
            { date: '2026-06-01', score: 4, total: 5, pointsEarned: 80 },
            { date: '2026-06-07', score: 4, total: 5, pointsEarned: 80 },
        ],
    }];

    let users = JSON.parse(localStorage.getItem('ogrenAI_users')) || [];
    if (users.length === 0) {
        users = JSON.parse(JSON.stringify(DEFAULT_USERS));
        localStorage.setItem('ogrenAI_users', JSON.stringify(users));
    }
    let currentUserEmail = localStorage.getItem('ogrenAI_currentUser') || null;
    let currentUser = users.find(u => u.email === currentUserEmail) || null;

    let testQuestions = [];
    let testAnswers = [];
    let testActive = false;

    const questionPools = {
        arabalar: [
            { id: 'car1', subject: 'Matematik',
                text: 'Bir araba galerisinde 24 kırmızı araba ve 18 mavi araba bulunmaktadır. Galerideki toplam araba sayısı kaçtır?',
                options: ['38', '42', '44', '40'], correct: 1 },
            { id: 'car2', subject: 'Matematik',
                text: 'Bir yarış arabası pistin bir turunu 90 saniyede tamamlıyor. 5 tur sonunda toplam kaç saniye geçer?',
                options: ['400', '420', '450', '480'], correct: 2 },
            { id: 'car3', subject: 'Fen Bilgisi',
                text: 'Bir araba motorunun çalışma sıcaklığı yaklaşık 90°C\'dir. Suyun kaynama noktası 100°C olduğuna göre, motor sıcaklığı kaynama noktasından kaç °C daha düşüktür?',
                options: ['5°C', '10°C', '15°C', '20°C'], correct: 1 },
            { id: 'car4', subject: 'Türkçe',
                text: '"Araba" kelimesi hangi dil kökenlidir?',
                options: ['Türkçe', 'Arapça', 'Farsça', 'İtalyanca'], correct: 3 },
            { id: 'car5', subject: 'Matematik',
                text: 'Bir otoparkta her sırada 8 araba park edebilmektedir. 6 sıra dolu olduğuna göre otoparkta kaç araba vardır?',
                options: ['42', '44', '46', '48'], correct: 3 },
        ],
        hayvanlar: [
            { id: 'ani1', subject: 'Fen Bilgisi',
                text: 'Bir köpeğin vücut sıcaklığı ortalama 38.5°C\'dir. Bir kedinin vücut sıcaklığı ise ortalama 38°C\'dir. İkisi arasındaki sıcaklık farkı kaç °C\'dir?',
                options: ['0.3°C', '0.5°C', '0.8°C', '1°C'], correct: 1 },
            { id: 'ani2', subject: 'Matematik',
                text: 'Bir çiftlikte 15 koyun ve 23 tavuk vardır. Çiftlikteki toplam hayvan sayısı kaçtır?',
                options: ['35', '36', '37', '38'], correct: 3 },
            { id: 'ani3', subject: 'Türkçe',
                text: 'Aşağıdaki hayvanlardan hangisinin yazımı doğrudur?',
                options: ['kanarya', 'kanerya', 'kanarye', 'karnaya'], correct: 0 },
            { id: 'ani4', subject: 'Matematik',
                text: 'Bir veteriner kliniğinde günde 7 köpek muayene ediliyor. 5 günde toplam kaç köpek muayene edilir?',
                options: ['30', '32', '35', '37'], correct: 2 },
            { id: 'ani5', subject: 'Fen Bilgisi',
                text: 'Hangi hayvan memeli değildir?',
                options: ['Yunus', 'Yarasa', 'Penguen', 'Balina'], correct: 2 },
        ],
        spor: [
            { id: 'spo1', subject: 'Matematik',
                text: 'Bir futbol takımı 11 oyuncudan oluşur. Sahada 2 takım olduğuna göre toplam kaç oyuncu vardır?',
                options: ['20', '21', '22', '24'], correct: 2 },
            { id: 'spo2', subject: 'Matematik',
                text: 'Bir basketbol maçında atılan 3 sayılık 8 basket toplam kaç sayı eder?',
                options: ['20', '22', '24', '26'], correct: 2 },
        ],
        uzay: [
            { id: 'uz1', subject: 'Fen Bilgisi',
                text: 'Dünya\'ya en yakın gezegen hangisidir?',
                options: ['Mars', 'Venüs', 'Merkür', 'Jüpiter'], correct: 1 },
            { id: 'uz2', subject: 'Matematik',
                text: 'Bir roket saniyede 8 km yol alıyorsa, 60 saniyede kaç km yol alır?',
                options: ['420', '450', '480', '500'], correct: 2 },
        ],
        oyunlar: [
            { id: 'oy1', subject: 'Matematik',
                text: 'Bir oyuncu her bölümde 150 puan kazanıyor. 6 bölüm sonunda toplam kaç puanı olur?',
                options: ['750', '800', '850', '900'], correct: 3 },
            { id: 'oy2', subject: 'Türkçe',
                text: '"Oyun" kelimesinin eş anlamlısı hangisidir?',
                options: ['Spor', 'Yarış', 'Eğlence', 'Müsabaka'], correct: 2 },
        ],
    };

    const questionPoolsPresentation = {
        matematik: [
            { id: 'pres_mat_1', subject: 'Matematik',
                text: 'Bir sınıfta 8 sıra vardır. Her sırada 3 öğrenci oturduğuna göre sınıfta toplam kaç öğrenci vardır?',
                options: ['21', '24', '27', '30'], correct: 1 },
            { id: 'pres_mat_2', subject: 'Matematik',
                text: 'Buse\'nin 45 boya kalemi vardı. 18 tanesini arkadaşına verdi. Buse\'nin geriye kaç kalemi kaldı?',
                options: ['25', '27', '28', '30'], correct: 1 },
            { id: 'pres_mat_3', subject: 'Matematik',
                text: '5 katı 40 olan sayının 10 fazlası kaçtır?',
                options: ['18', '20', '25', '30'], correct: 0 },
            { id: 'pres_mat_4', subject: 'Matematik',
                text: 'Günde 4 sayfa kitap okuyan bir öğrenci, 2 haftada toplam kaç sayfa kitap okur?',
                options: ['28', '48', '56', '60'], correct: 2 },
            { id: 'pres_mat_5', subject: 'Matematik',
                text: 'Bir bölme işleminde bölünen 36, bölen 4 ise bölüm kaçtır?',
                options: ['8', '9', '10', '12'], correct: 1 },
            { id: 'pres_mat_6', subject: 'Matematik',
                text: 'Ali\'nin 15 TL\'si, Ayşe\'nin ise Ali\'nin parasının 3 katı kadar parası vardır. İkisinin toplam kaç TL\'si vardır?',
                options: ['45', '50', '60', '75'], correct: 2 },
            { id: 'pres_mat_7', subject: 'Matematik',
                text: 'Bir manavda sabah 85 kg elma vardı. Gün içinde elmaların 48 kg\'ı satıldı. Geriye kaç kg elma kaldı?',
                options: ['35', '37', '39', '41'], correct: 1 },
            { id: 'pres_mat_8', subject: 'Matematik',
                text: 'Saat 14:15\'te başlayan bir çizgi film 45 dakika sürmüştür. Çizgi film bittiğinde saat kaçtır?',
                options: ['14:45', '15:00', '15:15', '15:30'], correct: 1 },
            { id: 'pres_mat_9', subject: 'Matematik',
                text: 'Bir üçgenin tüm kenar uzunlukları birbirine eşittir. Bir kenarı 12 cm olduğuna göre, bu üçgenin çevre uzunluğu kaç cm\'dir?',
                options: ['24', '30', '36', '48'], correct: 2 },
            { id: 'pres_mat_10', subject: 'Matematik',
                text: 'Aşağıdaki sayılardan hangisi en yakın onluğa yuvarlandığında 70 olur?',
                options: ['63', '64', '75', '68'], correct: 3 }
        ],
        turkce: [
            { id: 'pres_tur_1', subject: 'Türkçe',
                text: 'Aşağıdaki kelimelerin hangisinde yazım yanlışı vardır?',
                options: ['Herkes', 'Yalnız', 'Kirbit', 'Tren'], correct: 2 },
            { id: 'pres_tur_2', subject: 'Türkçe',
                text: '"Kırmızı" kelimesinin eş anlamlısı aşağıdakilerden hangisidir?',
                options: ['Al', 'Ak', 'Kara', 'Yeşil'], correct: 0 },
            { id: 'pres_tur_3', subject: 'Türkçe',
                text: 'Aşağıdaki cümlelerin hangisinin sonuna soru işareti (?) konulmalıdır?',
                options: ['Bugün okula gittim', 'Yarın bize gelecek misin', 'Eyvah bardak kırıldı', 'Parkta oyun oynadık'], correct: 1 },
            { id: 'pres_tur_4', subject: 'Türkçe',
                text: '"Büyük" kelimesinin zıt anlamlısı hangisidir?',
                options: ['Geniş', 'Küçük', 'Kısa', 'Dar'], correct: 1 },
            { id: 'pres_tur_5', subject: 'Türkçe',
                text: 'Aşağıdaki kelimelerden hangisi sözlükte en önce yer alır?',
                options: ['Balık', 'Bebek', 'Bardak', 'Boya'], correct: 0 },
            { id: 'pres_tur_6', subject: 'Türkçe',
                text: '"Kitaplık" kelimesi kaç heceden oluşmaktadır?',
                options: ['2', '3', '4', '5'], correct: 1 },
            { id: 'pres_tur_7', subject: 'Türkçe',
                text: '"Sıcak" kelimesinin zıt anlamlısı hangisidir?',
                options: ['Ilık', 'Soğuk', 'Serin', 'Don'], correct: 1 },
            { id: 'pres_tur_8', subject: 'Türkçe',
                text: 'Aşağıdaki tümcelerden hangisi kurallı bir cümledir?',
                options: ['Gitti okula erken', 'Dün çok kar yağdı', 'Aldım yeni bir kalem', 'Seviyorum kitap okumayı'], correct: 1 },
            { id: 'pres_tur_9', subject: 'Türkçe',
                text: '"Okul" sözcüğünün eş anlamlısı hangisidir?',
                options: ['Mektep', 'Sınıf', 'Öğretmen', 'Muallim'], correct: 0 },
            { id: 'pres_tur_10', subject: 'Türkçe',
                text: 'Aşağıdaki kelimelerin hangisi çoğul eki almıştır?',
                options: ['Kalemler', 'Masa', 'Sıra', 'Silgi'], correct: 0 }
        ],
        tarih: [
            { id: 'pres_tar_1', subject: 'Tarih',
                text: 'Türkiye Cumhuriyeti\'nin kurucusu ve ilk cumhurbaşkanı kimdir?',
                options: ['İsmet İnönü', 'Mustafa Kemal Atatürk', 'Fevzi Çakmak', 'Kazım Karabekir'], correct: 1 },
            { id: 'pres_tar_2', subject: 'Tarih',
                text: 'Cumhuriyet Bayramı\'nı her yıl hangi tarihte coşkuyla kutlarız?',
                options: ['23 Nisan', '19 Mayıs', '29 Ekim', '30 Ağustos'], correct: 2 },
            { id: 'pres_tar_3', subject: 'Tarih',
                text: 'İstiklal Marşı\'mızın şairi kimdir?',
                options: ['Mehmet Akif Ersoy', 'Ziya Gökalp', 'Namık Kemal', 'Reşat Nuri Güntekin'], correct: 0 },
            { id: 'pres_tar_4', subject: 'Tarih',
                text: 'Başkentimiz olan ilimiz aşağıdakilerden hangisidir?',
                options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], correct: 1 },
            { id: 'pres_tar_5', subject: 'Tarih',
                text: 'Milli Mücadele\'miz nerede başlamıştır?',
                options: ['Samsun', 'Sivas', 'Amasya', 'Erzurum'], correct: 0 },
            { id: 'pres_tar_6', subject: 'Tarih',
                text: 'Bayrağımızın üzerindeki renkler hangileridir?',
                options: ['Kırmızı ve Beyaz', 'Mavi ve Beyaz', 'Yeşil ve Kırmızı', 'Sarı ve Kırmızı'], correct: 0 },
            { id: 'pres_tar_7', subject: 'Tarih',
                text: 'Atatürk\'ün doğduğu şehir hangisidir?',
                options: ['Selanik', 'Ankara', 'İstanbul', 'İzmir'], correct: 0 },
            { id: 'pres_tar_8', subject: 'Tarih',
                text: 'Atatürk\'ün anıt mezarı olan Anıtkabir hangi şehrimizdedir?',
                options: ['İstanbul', 'Ankara', 'İzmir', 'Samsun'], correct: 1 },
            { id: 'pres_tar_9', subject: 'Tarih',
                text: '23 Nisan günü hangi bayramı kutlarız?',
                options: ['Gençlik Bayramı', 'Spor Bayramı', 'Ulusal Egemenlik ve Çocuk Bayramı', 'Zafer Bayramı'], correct: 2 },
            { id: 'pres_tar_10', subject: 'Tarih',
                text: 'Ülkemizin resmi dili hangisidir?',
                options: ['İngilizce', 'Türkçe', 'Arapça', 'Almanca'], correct: 1 }
        ]
    };

    function getQuestionsForPreferences(preferences, count = 10) {
        let pool = [];
        preferences.forEach(pref => {
            if (questionPools[pref]) {
                pool = pool.concat(questionPools[pref]);
            } else {
                const capPref = pref.charAt(0).toUpperCase() + pref.slice(1);
                pool.push({
                    id: `custom_${pref}_1`,
                    subject: 'Genel Kültür',
                    text: `Aşağıdaki terimlerden hangisi doğrudan "${capPref}" konusu ile ilişkilidir?`,
                    options: [`${capPref} alanına ait temel kavram`, `Farklı bir konu`, `Alakasız terim`, `Yanlış cevap`],
                    correct: 0
                });
                pool.push({
                    id: `custom_${pref}_2`,
                    subject: 'Türkçe',
                    text: `"${capPref}" kelimesi Türkçe sözlükte hangi anlamda kullanılır?`,
                    options: [`İlgili temel kavram`, `Hiçbiri`, `Gereksiz sözcük`, `Yanlış tanım`],
                    correct: 0
                });
            }
        });

        if (pool.length < count) {
            const otherPrefs = Object.keys(questionPools).filter(p => !preferences.includes(p));
            let otherPool = [];
            otherPrefs.forEach(pref => {
                otherPool = otherPool.concat(questionPools[pref]);
            });
            otherPool.sort(() => Math.random() - 0.5);
            pool = pool.concat(otherPool);
        }

        if (pool.length === 0) {
            Object.values(questionPools).forEach(p => { pool = pool.concat(p); });
        }

        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    users.forEach(u => {
        if (!u.grade) {
            u.grade = '3. Sınıf';
        }
        u.completedTests.forEach((t, index) => {
            if (!t.questions) {
                t.id = 'test_default_' + index;
                const mockQuestions = getQuestionsForPreferences(u.preferences, t.total);
                t.questions = mockQuestions;
                t.userAnswers = mockQuestions.map((q, qIndex) => {
                    if (qIndex < t.score) {
                        return q.correct;
                    } else {
                        return (q.correct + 1) % q.options.length;
                    }
                });
            }
        });
        if (u.lastTest && !u.lastTest.questions) {
            const correspondingTest = u.completedTests[u.completedTests.length - 1];
            if (correspondingTest) {
                u.lastTest = JSON.parse(JSON.stringify(correspondingTest));
            }
        }
    });
    localStorage.setItem('ogrenAI_users', JSON.stringify(users));

    function saveUsers() {
        localStorage.setItem('ogrenAI_users', JSON.stringify(users));
    }

    function saveCurrentUser() {
        if (currentUser) {
            localStorage.setItem('ogrenAI_currentUser', currentUser.email);
        } else {
            localStorage.removeItem('ogrenAI_currentUser');
        }
    }

    function updateNavUI() {
        if (currentUser) {
            navLoginItem.classList.add('d-none-view');
            navRegisterItem.classList.add('d-none-view');
            navTestItem.classList.remove('d-none-view');
            navProfileItem.classList.remove('d-none-view');
            navUserBadge.classList.remove('d-none-view');
            navLogoutBtn.classList.remove('d-none-view');
            navUsernameDisplay.textContent = currentUser.name.split(' ')[0];
            homeCTA.classList.add('d-none-view');
            homeLoggedInCTA.classList.remove('d-none-view');
            navHome.classList.add('active');
            navLogin.classList.remove('active');
            navRegister.classList.remove('active');
        } else {
            navLoginItem.classList.remove('d-none-view');
            navRegisterItem.classList.remove('d-none-view');
            navTestItem.classList.add('d-none-view');
            navProfileItem.classList.add('d-none-view');
            navUserBadge.classList.add('d-none-view');
            navLogoutBtn.classList.add('d-none-view');
            homeCTA.classList.remove('d-none-view');
            homeLoggedInCTA.classList.add('d-none-view');
        }
    }

    function switchView(viewName) {
        Object.values(views).forEach(v => v.classList.add('d-none-view'));
        if (views[viewName]) {
            views[viewName].classList.remove('d-none-view');
            views[viewName].style.animation = 'none';
            views[viewName].offsetHeight;
            views[viewName].style.animation = 'fadeIn 0.35s ease';
        }
        document.querySelectorAll('#navLinks .nav-link').forEach(link => link.classList.remove('active'));
        const activeNavMap = {
            homeView: navHome,
            loginView: navLogin,
            registerView: navRegister,
            testView: navTest,
            profileView: navProfile,
        };
        if (activeNavMap[viewName]) activeNavMap[viewName].classList.add('active');

        if (viewName === 'profileView' && currentUser) {
            refreshProfilePage();
        }
        if (viewName === 'testView' && currentUser) {
            refreshTestPreScreen();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function showToast(message, type = 'success') {
        toastMsg.textContent = message;
        toastEl.className = 'toast-custom ' + (type === 'success' ? 'toast-success' : 'toast-error') + ' show';
        clearTimeout(toastEl._timeout);
        toastEl._timeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    }

    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();

        if (!email || !email.includes('@') || !email.includes('.')) {
            showToast('Geçerli bir e-posta adresi giriniz.', 'error');
            return;
        }
        if (!password || password.length < 3) {
            showToast('Şifre en az 3 karakter olmalıdır.', 'error');
            return;
        }

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        if (user) {
            currentUser = user;
            saveCurrentUser();
            updateNavUI();
            showToast(`Hoş geldin, ${user.name.split(' ')[0]}! 🎉`, 'success');
            switchView('homeView');
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
        } else {
            showToast('E-posta veya şifre hatalı. Lütfen tekrar deneyin.', 'error');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value.trim();
        const selectedInterests = [];
        document.querySelectorAll('#registerInterests .interest-tag.selected').forEach(tag => {
            selectedInterests.push(tag.dataset.interest);
        });

        if (!name || name.length < 3) {
            showToast('Ad soyad en az 3 karakter olmalıdır.', 'error');
            return;
        }
        if (!email || !email.includes('@') || !email.includes('.')) {
            showToast('Geçerli bir e-posta adresi giriniz.', 'error');
            return;
        }
        if (!password || password.length < 3) {
            showToast('Şifre en az 3 karakter olmalıdır.', 'error');
            return;
        }
        if (selectedInterests.length === 0) {
            showToast('En az bir ilgi alanı seçmelisiniz.', 'error');
            return;
        }
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast('Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.', 'error');
            return;
        }

        const newUser = {
            name: name,
            email: email.toLowerCase(),
            password: password,
            grade: '3. Sınıf',
            preferences: selectedInterests,
            stats: {
                totalPoints: 0,
                testsCompleted: 0,
                correctAnswers: 0,
                totalQuestions: 0,
                accuracy: 0,
            },
            badges: [],
            apiKey: '',
            lastTest: null,
            completedTests: [],
        };
        users.push(newUser);
        saveUsers();
        currentUser = newUser;
        saveCurrentUser();
        updateNavUI();
        showToast(`Kayıt başarılı! Hoş geldin, ${name.split(' ')[0]}! 🎉`, 'success');
        document.getElementById('regName').value = '';
        document.getElementById('regEmail').value = '';
        document.getElementById('regPassword').value = '';
        document.querySelectorAll('#registerInterests .interest-tag').forEach(t => t.classList.remove('selected'));
        switchView('homeView');
    }

    function logout() {
        currentUser = null;
        saveCurrentUser();
        updateNavUI();
        testQuestions = [];
        testAnswers = [];
        testActive = false;
        resetTestUI();
        showToast('Başarıyla çıkış yapıldı.', 'success');
        switchView('homeView');
    }

    function refreshProfilePage() {
        if (!currentUser) return;
        document.getElementById('profileInitial').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('statPoints').textContent = currentUser.stats.totalPoints;
        document.getElementById('statTests').textContent = currentUser.stats.testsCompleted;
        document.getElementById('statCorrect').textContent = currentUser.stats.correctAnswers;
        document.getElementById('statAccuracy').textContent = '%' + currentUser.stats.accuracy;

        const level = Math.floor(currentUser.stats.totalPoints / 50) + 1;
        document.getElementById('profileLevel').innerHTML = `<i class="fa-solid fa-star"></i> Seviye ${level}`;

        const profileGrade = document.getElementById('profileGrade');
        if (profileGrade) {
            profileGrade.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${currentUser.grade || '3. Sınıf'} Düzeyi`;
        }

        const profileInterestsContainer = document.getElementById('profileInterests');
        const interestLabels = {
            arabalar: { icon: 'fa-car', text: 'Arabalar' },
            hayvanlar: { icon: 'fa-paw', text: 'Hayvanlar' },
            spor: { icon: 'fa-futbol', text: 'Spor' },
            uzay: { icon: 'fa-rocket', text: 'Uzay' },
            oyunlar: { icon: 'fa-gamepad', text: 'Oyunlar' },
        };
        profileInterestsContainer.innerHTML = currentUser.preferences.map(p => {
            const info = interestLabels[p] || { icon: 'fa-star', text: p.charAt(0).toUpperCase() + p.slice(1) };
            return `<span class="interest-tag selected"><i class="fa-solid ${info.icon}"></i> ${info.text}</span>`;
        }).join('');

        const badgesContainer = document.getElementById('badgesContainer');
        if (currentUser.badges.length === 0) {
            badgesContainer.innerHTML = '<span class="text-muted small">Henüz rozet kazanılmadı. Test çözerek rozet kazanabilirsin!</span>';
        } else {
            const badgeClasses = ['badge-gold', 'badge-silver', 'badge-accent', 'badge-bronze'];
            badgesContainer.innerHTML = currentUser.badges.map((b, i) => {
                const cls = badgeClasses[i % badgeClasses.length];
                return `<span class="badge-achievement ${cls}"><i class="fa-solid fa-award"></i> ${b}</span>`;
            }).join('');
        }

        document.getElementById('apiKeyInput').value = currentUser.apiKey || '';
        document.getElementById('apiKeyStatus').textContent = currentUser.apiKey ? '✅ Anahtar kaydedildi' : '';

        const completedTestsList = document.getElementById('completedTestsList');
        if (currentUser.completedTests && currentUser.completedTests.length > 0) {
            const reversedTests = [...currentUser.completedTests].reverse();
            completedTestsList.innerHTML = reversedTests.map((t, idx) => {
                const realIdx = currentUser.completedTests.length - 1 - idx;
                return `
                    <div class="d-flex justify-content-between align-items-center p-2 mb-2 rounded border" style="background: var(--bg-card); border-color: var(--border-color) !important;">
                        <div>
                            <span class="fw-semibold small d-block">${t.date} Tarihli Test</span>
                            <span class="text-muted small">Skor: ${t.score} / ${t.total} doğru</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge-achievement badge-accent font-monospace">+${t.pointsEarned} P</span>
                            <button class="btn btn-sm btn-outline-accent py-1 px-2" onclick="showTestDetails(${realIdx})">
                                Detay
                            </button>
                        </div>
                    </div>`;
            }).join('');
        } else {
            completedTestsList.innerHTML = '<p class="text-muted small mb-0">Henüz bir test çözülmedi.</p>';
        }

        const staticInterests = ['arabalar', 'hayvanlar', 'spor', 'uzay', 'oyunlar'];
        const modalInterestsContainer = document.getElementById('modalInterests');
        modalInterestsContainer.querySelectorAll('.interest-tag').forEach(tag => {
            if (!staticInterests.includes(tag.dataset.interest)) {
                tag.remove();
            }
        });

        currentUser.preferences.forEach(pref => {
            if (!staticInterests.includes(pref)) {
                const newTag = document.createElement('span');
                newTag.className = 'interest-tag selected';
                newTag.dataset.interest = pref;
                const displayValue = pref.charAt(0).toUpperCase() + pref.slice(1);
                newTag.innerHTML = `<i class="fa-solid fa-star"></i> ${displayValue}`;
                newTag.addEventListener('click', function() {
                    this.classList.toggle('selected');
                });
                modalInterestsContainer.appendChild(newTag);
            }
        });

        document.querySelectorAll('#modalInterests .interest-tag').forEach(tag => {
            tag.classList.toggle('selected', currentUser.preferences.includes(tag.dataset.interest));
        });
    }

    function saveApiKey() {
        if (!currentUser) return;
        const key = document.getElementById('apiKeyInput').value.trim();
        currentUser.apiKey = key;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex >= 0) users[userIndex] = currentUser;
        saveUsers();
        document.getElementById('apiKeyStatus').textContent = key ? '✅ Anahtar kaydedildi' : 'Anahtar kaldırıldı';
        showToast(key ? 'API anahtarı kaydedildi.' : 'API anahtarı kaldırıldı.', 'success');
    }

    function saveInterestsFromModal() {
        if (!currentUser) return;
        const selected = [];
        document.querySelectorAll('#modalInterests .interest-tag.selected').forEach(tag => {
            selected.push(tag.dataset.interest);
        });
        if (selected.length === 0) {
            showToast('En az bir ilgi alanı seçmelisiniz.', 'error');
            return;
        }
        currentUser.preferences = selected;
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex >= 0) users[userIndex] = currentUser;
        saveUsers();
        refreshProfilePage();
        const modal = bootstrap.Modal.getInstance(document.getElementById('editInterestsModal'));
        if (modal) modal.hide();
        showToast('İlgi alanların güncellendi! 🎯', 'success');
    }

    function addCustomInterest() {
        const input = document.getElementById('customInterestInput');
        const value = input.value.trim().toLowerCase();
        if (!value) return;

        const existingTag = document.querySelector(`#modalInterests .interest-tag[data-interest="${value}"]`);
        if (existingTag) {
            existingTag.classList.add('selected');
            input.value = '';
            return;
        }

        const container = document.getElementById('modalInterests');
        const newTag = document.createElement('span');
        newTag.className = 'interest-tag selected';
        newTag.dataset.interest = value;
        const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
        newTag.innerHTML = `<i class="fa-solid fa-star"></i> ${displayValue}`;
        newTag.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
        container.appendChild(newTag);
        input.value = '';
    }

    function refreshTestPreScreen() {
        if (!currentUser) return;
        if (testActive) {
            document.getElementById('testPreScreen').classList.add('d-none-view');
            document.getElementById('testActiveScreen').classList.remove('d-none-view');
            document.getElementById('testResultScreen').classList.add('d-none-view');
            return;
        }
        const interestLabels = {
            arabalar: 'arabalar',
            hayvanlar: 'hayvanlar',
            spor: 'spor',
            uzay: 'uzay',
            oyunlar: 'oyunlar',
        };
        const display = currentUser.preferences.map(p => interestLabels[p] || p.charAt(0).toUpperCase() + p.slice(1)).join(' ve ');
        document.getElementById('testInterestDisplay').textContent = display;

        const prevResultDiv = document.getElementById('previousTestResult');
        if (currentUser.lastTest) {
            prevResultDiv.classList.remove('d-none-view');
            const lastTestIndex = currentUser.completedTests.length - 1;
            prevResultDiv.innerHTML = `
                <div class="card-custom" style="border-left: 4px solid var(--accent); cursor: pointer;" onclick="showTestDetails(${lastTestIndex})">
                    <div class="card-body-custom d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-1"><i class="fa-solid fa-clock-rotate-left"></i> Son Test Özeti</h6>
                            <p class="mb-1 small text-muted"><strong>Tarih:</strong> ${currentUser.lastTest.date}</p>
                            <p class="mb-1 small text-muted"><strong>Skor:</strong> ${currentUser.lastTest.score} / ${currentUser.lastTest.total} doğru</p>
                            <span class="badge-achievement badge-accent">+${currentUser.lastTest.pointsEarned} Puan</span>
                        </div>
                        <button class="btn btn-sm btn-outline-accent">
                            <i class="fa-solid fa-eye"></i> Detayları Gör
                        </button>
                    </div>
                </div>`;
        } else {
            prevResultDiv.classList.add('d-none-view');
        }
    }

    function startTest() {
        if (!currentUser) {
            showToast('Önce giriş yapmalısınız.', 'error');
            switchView('loginView');
            return;
        }
        testQuestions = getQuestionsForPreferences(currentUser.preferences, 10);
        testAnswers = new Array(testQuestions.length).fill(null);
        testActive = true;

        document.getElementById('testPreScreen').classList.add('d-none-view');
        document.getElementById('testActiveScreen').classList.remove('d-none-view');
        document.getElementById('testResultScreen').classList.add('d-none-view');
        document.getElementById('submitTestBtn').classList.remove('d-none-view');

        renderQuestions();
        updateTestProgress();

        document.getElementById('testActiveScreen').scrollIntoView({ behavior: 'smooth' });
    }

    function handleStartTestClick() {
        if (!currentUser) {
            showToast('Önce giriş yapmalısınız.', 'error');
            switchView('loginView');
            return;
        }
        if (testActive) {
            switchView('testView');
        } else {
            testQuestions = getQuestionsForPreferences(currentUser.preferences, 10);
            testAnswers = new Array(testQuestions.length).fill(null);
            testActive = true;

            switchView('testView');

            document.getElementById('testPreScreen').classList.add('d-none-view');
            document.getElementById('testActiveScreen').classList.remove('d-none-view');
            document.getElementById('testResultScreen').classList.add('d-none-view');
            document.getElementById('submitTestBtn').classList.remove('d-none-view');

            renderQuestions();
            updateTestProgress();
        }
    }

    function generatePresentationTest() {
        if (!currentUser) {
            showToast('Önce giriş yapmalısınız.', 'error');
            switchView('loginView');
            return;
        }

        const subject = document.getElementById('presentationSubjectSelect').value;

        document.getElementById('testPreScreen').classList.add('d-none-view');
        document.getElementById('testActiveScreen').classList.add('d-none-view');
        document.getElementById('testResultScreen').classList.add('d-none-view');
        document.getElementById('testLoadingScreen').classList.remove('d-none-view');

        const messages = [
            "Yapay zekâ modeline bağlanılıyor...",
            "Öğrenci profili analiz ediliyor (3. Sınıf Düzeyi)...",
            "Seçilen ders için kazanımlar sorgulanıyor...",
            "Kişiselleştirilmiş soru havuzu taranıyor...",
            "3. sınıf müfredatına uygun sorular seçiliyor...",
            "Sorular ilgi çekici temalarla harmanlanıyor...",
            "Çeldirici seçenekler kalibre ediliyor...",
            "Görsel öğeler ve ipuçları yerleştiriliyor...",
            "Test tamamlanıyor ve optimize ediliyor...",
            "Test hazır! Yönlendiriliyorsunuz..."
        ];

        let progress = 0;
        const duration = 10000;
        const intervalTime = 100;
        const totalSteps = duration / intervalTime;

        const progressBar = document.getElementById('loadingProgressBar');
        const percentageText = document.getElementById('loadingPercentage');
        const statusText = document.getElementById('loadingStatusText');

        const interval = setInterval(() => {
            progress++;
            const percentage = Math.min(Math.round((progress / totalSteps) * 100), 100);
            progressBar.style.width = percentage + '%';
            percentageText.textContent = percentage + '%';

            const msgIndex = Math.min(Math.floor(percentage / 10), messages.length - 1);
            statusText.textContent = messages[msgIndex];

            if (progress >= totalSteps) {
                clearInterval(interval);

                let chosenPool = [];
                if (subject === 'matematik') {
                    chosenPool = questionPoolsPresentation.matematik;
                } else if (subject === 'turkce') {
                    chosenPool = questionPoolsPresentation.turkce;
                } else if (subject === 'tarih') {
                    chosenPool = questionPoolsPresentation.tarih;
                } else {
                    chosenPool = questionPoolsPresentation.matematik;
                }

                testQuestions = JSON.parse(JSON.stringify(chosenPool)).sort(() => Math.random() - 0.5);
                testAnswers = new Array(testQuestions.length).fill(null);
                testActive = true;

                document.getElementById('testLoadingScreen').classList.add('d-none-view');
                document.getElementById('testActiveScreen').classList.remove('d-none-view');
                document.getElementById('submitTestBtn').classList.remove('d-none-view');

                renderQuestions();
                updateTestProgress();

                showToast('Yapay zekâ testi başarıyla oluşturuldu!', 'success');
                document.getElementById('testActiveScreen').scrollIntoView({ behavior: 'smooth' });
            }
        }, intervalTime);
    }

    function renderQuestions() {
        const container = document.getElementById('questionsContainer');
        const subjectIcons = {
            'Matematik': 'fa-calculator',
            'Fen Bilgisi': 'fa-flask',
            'Türkçe': 'fa-book',
            'Genel Kültür': 'fa-globe'
        };
        container.innerHTML = testQuestions.map((q, i) => {
            const subIcon = subjectIcons[q.subject] || 'fa-question';
            return `
                <div class="question-card" style="animation-delay: ${i * 0.08}s;">
                    <h6 class="fw-bold mb-3">
                        <span class="q-number">${i + 1}</span>
                        <i class="fa-solid ${subIcon}" style="color: var(--accent); margin-right: 0.3rem;"></i>
                        <span style="color: var(--text-muted); font-weight: 500; font-size: 0.8rem;">${q.subject}</span>
                    </h6>
                    <p class="mb-3 fw-medium">${q.text}</p>
                    <div class="options-container" data-question-index="${i}">
                        ${q.options.map((opt, oi) => {
                            const letter = String.fromCharCode(65 + oi);
                            return `
                                <label class="option-item" data-option-index="${oi}">
                                    <span style="font-weight:700; color:var(--accent); margin-right:0.5rem;">${letter})</span>
                                    ${opt}
                                </label>`;
                        }).join('')}
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.option-item').forEach(optionEl => {
            optionEl.addEventListener('click', function() {
                const questionIndex = parseInt(this.closest('.options-container').dataset.questionIndex);
                const optionIndex = parseInt(this.dataset.optionIndex);
                selectOption(questionIndex, optionIndex);
            });
        });
    }

    function selectOption(questionIndex, optionIndex) {
        if (!testActive) return;
        testAnswers[questionIndex] = optionIndex;

        const optionsContainer = document.querySelector(`.options-container[data-question-index="${questionIndex}"]`);
        if (optionsContainer) {
            optionsContainer.querySelectorAll('.option-item').forEach((el, i) => {
                el.classList.remove('selected-correct', 'selected-wrong');
                if (i === optionIndex) {
                    el.style.borderColor = 'var(--accent)';
                    el.style.background = 'var(--accent-light)';
                    el.style.fontWeight = '600';
                } else {
                    el.style.borderColor = 'var(--border-color)';
                    el.style.background = 'transparent';
                    el.style.fontWeight = '500';
                }
            });
        }
        updateTestProgress();
    }

    function updateTestProgress() {
        const answered = testAnswers.filter(a => a !== null).length;
        const total = testQuestions.length;
        document.getElementById('testProgressBadge').textContent = `Soru ${answered} / ${total}`;
        document.getElementById('testProgressBar').style.width = `${(answered / total) * 100}%`;
    }

    function submitTest() {
        if (!testActive || testQuestions.length === 0) return;
        const unanswered = testAnswers.filter(a => a === null).length;
        if (unanswered > 0) {
            showToast(`Lütfen tüm soruları cevaplayın. ${unanswered} soru cevapsız.`, 'error');
            return;
        }

        let correctCount = 0;
        testQuestions.forEach((q, i) => {
            if (testAnswers[i] === q.correct) correctCount++;
        });
        const pointsEarned = correctCount * (100 / testQuestions.length);

        testQuestions.forEach((q, i) => {
            const container = document.querySelector(`.options-container[data-question-index="${i}"]`);
            if (container) {
                container.querySelectorAll('.option-item').forEach((el, oi) => {
                    el.style.pointerEvents = 'none';
                    el.style.cursor = 'default';
                    if (oi === q.correct) {
                        el.classList.add('selected-correct');
                    }
                    if (oi === testAnswers[i] && testAnswers[i] !== q.correct) {
                        el.classList.add('selected-wrong');
                    }
                });
            }
        });

        currentUser.stats.testsCompleted += 1;
        currentUser.stats.correctAnswers += correctCount;
        currentUser.stats.totalQuestions += testQuestions.length;
        currentUser.stats.totalPoints += pointsEarned;
        currentUser.stats.accuracy = Math.round((currentUser.stats.correctAnswers / currentUser.stats.totalQuestions) * 100);

        currentUser.lastTest = {
            id: 'test_' + Date.now(),
            date: new Date().toISOString().split('T')[0],
            score: correctCount,
            total: testQuestions.length,
            pointsEarned: pointsEarned,
            questions: JSON.parse(JSON.stringify(testQuestions)),
            userAnswers: [...testAnswers]
        };
        currentUser.completedTests.push({ ...currentUser.lastTest });

        const newBadges = [];
        if (currentUser.stats.testsCompleted === 1 && !currentUser.badges.includes('İlk Test')) {
            currentUser.badges.push('İlk Test');
            newBadges.push('İlk Test');
        }
        if (currentUser.stats.correctAnswers >= 5 && !currentUser.badges.includes('5 Doğru')) {
            currentUser.badges.push('5 Doğru');
            newBadges.push('5 Doğru');
        }
        if (currentUser.stats.testsCompleted >= 3 && !currentUser.badges.includes('3 Test Tamamlandı')) {
            currentUser.badges.push('3 Test Tamamlandı');
            newBadges.push('3 Test Tamamlandı');
        }
        if (correctCount === testQuestions.length && !currentUser.badges.includes('Tam İsabet')) {
            currentUser.badges.push('Tam İsabet');
            newBadges.push('Tam İsabet');
        }

        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex >= 0) users[userIndex] = currentUser;
        saveUsers();

        document.getElementById('testActiveScreen').classList.add('d-none-view');
        document.getElementById('testResultScreen').classList.remove('d-none-view');
        document.getElementById('resultCorrect').textContent = correctCount;
        document.getElementById('resultWrong').textContent = testQuestions.length - correctCount;
        document.getElementById('resultPoints').textContent = '+' + pointsEarned;

        const newBadgesContainer = document.getElementById('newBadgesContainer');
        if (newBadges.length > 0) {
            newBadgesContainer.innerHTML = `
                <div class="mt-3 p-3 rounded" style="background: var(--warning-light); border-radius: var(--radius);">
                    <h6 class="fw-bold" style="color: #f59e0b;"><i class="fa-solid fa-trophy pulse-animation"></i> Yeni Rozet(ler) Kazandın!</h6>
                    <div class="d-flex flex-wrap gap-2 justify-content-center">
                        ${newBadges.map(b => `<span class="badge-achievement badge-gold pulse-animation"><i class="fa-solid fa-award"></i> ${b}</span>`).join('')}
                    </div>
                </div>`;
        } else {
            newBadgesContainer.innerHTML = '';
        }

        testActive = false;
        document.getElementById('submitTestBtn').classList.add('d-none-view');
        updateNavUI();
        showToast(`Test bitti! ${correctCount}/${testQuestions.length} doğru, +${pointsEarned} puan! 🎉`, 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function resetTest() {
        testQuestions = [];
        testAnswers = [];
        testActive = false;
        resetTestUI();
        switchView('testView');
    }

    function resetTestUI() {
        document.getElementById('testPreScreen').classList.remove('d-none-view');
        document.getElementById('testActiveScreen').classList.add('d-none-view');
        document.getElementById('testResultScreen').classList.add('d-none-view');
        document.getElementById('submitTestBtn').classList.add('d-none-view');
        document.getElementById('questionsContainer').innerHTML = '';
        document.getElementById('testProgressBar').style.width = '0%';
        document.getElementById('testProgressBadge').textContent = 'Soru 0 / 10';
        document.getElementById('previousTestResult').classList.add('d-none-view');
        if (currentUser) refreshTestPreScreen();
    }

    function showTestDetails(index) {
        if (!currentUser || !currentUser.completedTests || !currentUser.completedTests[index]) return;
        const test = currentUser.completedTests[index];

        const infoDiv = document.getElementById('testDetailsInfo');
        const accuracy = Math.round((test.score / test.total) * 100);
        infoDiv.innerHTML = `
            <div class="row text-center">
                <div class="col-4">
                    <div class="fw-bold text-accent" style="font-size: 1.2rem;">${test.date}</div>
                    <div class="text-muted small">Tarih</div>
                </div>
                <div class="col-4">
                    <div class="fw-bold text-accent" style="font-size: 1.2rem;">${test.score} / ${test.total}</div>
                    <div class="text-muted small">Skor</div>
                </div>
                <div class="col-4">
                    <div class="fw-bold text-accent" style="font-size: 1.2rem;">%${accuracy}</div>
                    <div class="text-muted small">Doğruluk</div>
                </div>
            </div>
        `;

        const questionsContainer = document.getElementById('testDetailsQuestions');
        const subjectIcons = {
            'Matematik': 'fa-calculator',
            'Fen Bilgisi': 'fa-flask',
            'Türkçe': 'fa-book',
            'Genel Kültür': 'fa-globe',
            'Tarih': 'fa-globe'
        };

        questionsContainer.innerHTML = test.questions.map((q, i) => {
            const subIcon = subjectIcons[q.subject] || 'fa-question';
            const userAnswer = test.userAnswers[i];
            return `
                <div class="question-card mb-3 p-3 border rounded">
                    <h6 class="fw-bold mb-2 small">
                        <span class="q-number" style="width:24px; height:24px; line-height:24px; font-size:0.75rem;">${i + 1}</span>
                        <i class="fa-solid ${subIcon}" style="color: var(--accent); margin-right: 0.3rem;"></i>
                        <span style="color: var(--text-muted); font-weight: 500; font-size: 0.75rem;">${q.subject}</span>
                    </h6>
                    <p class="mb-2 fw-medium small">${q.text}</p>
                    <div class="options-container">
                        ${q.options.map((opt, oi) => {
                            const letter = String.fromCharCode(65 + oi);
                            let optionClass = '';
                            if (oi === q.correct) {
                                optionClass = 'selected-correct';
                            } else if (oi === userAnswer) {
                                optionClass = 'selected-wrong';
                            }
                            return `
                                <div class="option-item p-2 mb-1 small ${optionClass}" style="pointer-events: none; cursor: default;">
                                    <span style="font-weight:700; color:var(--accent); margin-right:0.5rem;">${letter})</span>
                                    ${opt}
                                </div>`;
                        }).join('')}
                    </div>
                </div>`;
        }).join('');

        const modal = new bootstrap.Modal(document.getElementById('testDetailsModal'));
        modal.show();
    }

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('navLogoutBtn').addEventListener('click', logout);
    document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKey);
    document.getElementById('saveInterestsBtn').addEventListener('click', saveInterestsFromModal);

    document.querySelectorAll('#navLinks .nav-link[data-view]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const viewName = this.dataset.view;
            if (['testView', 'profileView'].includes(viewName) && !currentUser) {
                showToast('Bu sayfayı görüntülemek için giriş yapmalısınız.', 'error');
                switchView('loginView');
                return;
            }
            switchView(viewName);
        });
    });

    darkToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        darkToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        darkToggle.title = isDark ? 'Aydınlık Mod' : 'Karanlık Mod';
        localStorage.setItem('ogrenAI_darkMode', isDark ? 'dark' : 'light');
    });

    document.querySelectorAll('#registerInterests .interest-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    document.querySelectorAll('#modalInterests .interest-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });

    function init() {
        const savedDarkMode = localStorage.getItem('ogrenAI_darkMode');
        if (savedDarkMode === 'dark') {
            body.classList.add('dark-mode');
            darkToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
            darkToggle.title = 'Aydınlık Mod';
        }

        updateNavUI();

        if (currentUser) {
            switchView('homeView');
            refreshProfilePage();
            refreshTestPreScreen();
        } else {
            switchView('homeView');
        }
    }

    init();

    window.switchView = switchView;
    window.startTest = startTest;
    window.submitTest = submitTest;
    window.resetTest = resetTest;
    window.saveApiKey = saveApiKey;
    window.saveInterestsFromModal = saveInterestsFromModal;
    window.handleStartTestClick = handleStartTestClick;
    window.addCustomInterest = addCustomInterest;
    window.generatePresentationTest = generatePresentationTest;
    window.showTestDetails = showTestDetails;
})();
