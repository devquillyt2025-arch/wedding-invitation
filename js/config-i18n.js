'use strict';
/* Invitation copy + settings. Edit text here; Kannada is the default language. */

/* ══════════════════════════════════════════════════════════════
   CONFIG
   ══════════════════════════════════════════════════════════════ */
const CONFIG = {
  weddingStart: '2026-11-19T09:30:00+05:30', /* Dhaaraa Muhurtha, IST — countdown target */
  weddingHours: 1,                           /* muhurtha 9:30–10:30 → calendar event length */
  whatsapp: '918951813296',                  /* country code + number, digits only */
  calendarTitle: 'Nitin & Amulya — Dhaaraa Muhurtha',
  calendarPlace: 'Madhava Mangala Samudaya Bhavana, Near Delhi World School, Malligenahalli, Sagara Road, Shivamogga',
  /* Path/URL to the MP3; leave empty to use the built-in synthesised instrumental. */
  musicUrl: 'Madarangi-Kannada.mp3'          /* must sit in the same folder as this HTML file */
};

/* ══════════════════════════════════════════════════════════════
   I18N STORE — every swappable string, English + Kannada.
   Static headings and name lists use paired .only-en / .only-kn markup instead.
   ══════════════════════════════════════════════════════════════ */
const I18N = {
  en: {
    skipLink: 'Skip to invitation',
    envInvited: 'You are cordially invited',
    envTap: 'Tap the seal to open',
    heroPre: 'With the blessings of Late Smt. Gangamma & Late Sri Muttaiah',
    heroPost: 'A warm invitation to you and your family',
    heroDay: 'Nov',
    heroMonth: '2026',
    heroVenue: 'Madhava Mangala Samudaya Bhavana, Shivamogga',
    cdDays: 'Days', cdHours: 'Hours', cdMins: 'Mins', cdSecs: 'Secs',
    cdDone: 'Thank you for celebrating with us',
    scrollCue: 'Scroll',

    verseText: 'A whole human lifetime is one auspicious moment.\nMarriage is a path to walk together, not a house to arrive at.\nWhat keeps husband and wife living as one is love alone —\nlove is the bond.',
    verseBy: '— Rashtrakavi Kuvempu',

    coupleEyebrow: 'Two souls, one journey',
    couplePoem: 'As two hearts become one,\nand two families unite in this joyous celebration,\nas we walk together through the seven steps of the Saptapadi —\nmay your blessings be with us on our new journey.',
    groomRole: 'The Groom',
    brideRole: 'The Bride',
    groomAlt: 'Portrait of Nitin, the groom',
    brideAlt: 'Portrait of Amulya, the bride',
    groomBio: 'B.E. Computer Science',
    brideBio: 'B.E. Civil Engineering',
    groomParents: 'Eldest son of Smt. Yashoda & Sri Venkatesh (Ex-BSF), Mysuru',
    brideParents: 'Eldest daughter of Smt. Sridevi & Sri Sharanappa Olekara (Retd. Agriculture Officer, Dept. of Agriculture), Shivamogga',

    eventsEyebrow: 'Join us for',
    rcDate: 'Wednesday, 18 November 2026', rcTime: '7:30 PM',
    muDate: 'Thursday, 19 November 2026', muTime: '9:30 AM – 10:30 AM', muLagna: 'Dhanur Lagna',
    muNote: 'Parabhava Samvatsara · Dakshinayana · Sharad Ritu · Kartika Masa · Shukla Paksha Dashami',
    evVenue: 'Madhava Mangala Samudaya Bhavana, Shivamogga',

    venueEyebrow: 'Where hearts unite',
    venueAddr: 'Near Delhi World School, Malligenahalli, Sagara Road, Shivamogga',
    venueNote: 'Reception & Muhurtha both at this venue',
    mapsBtn: 'Open in Google Maps',
    calBtn: 'Add to Calendar',

    galleryEyebrow: 'Our story in frames',
    galleryHint: 'Swipe or tap a photo',
    galPrev: 'Previous photo', galNext: 'Next photo', lbClose: 'Close',

    rsvpEyebrow: 'Kindly respond',
    rsvpText: "On this auspicious occasion, we lovingly invite you and your family to attend our children's wedding, bless the newly-wed couple and shower them with your blessings.",
    rsvpBtn: 'RSVP on WhatsApp',
    rsvpMsg: "Namaste! I'd be delighted to attend Nitin & Amulya's wedding (Reception on 18 Nov, Muhurtha on 19 Nov 2026).\nName: \nNumber of guests: ",

    familiesEyebrow: 'With love from both families',
    groomSide: "Groom's family",
    brideSide: "Bride's family",
    wishersTitle: 'Wishing for your joyful arrival',

    footerNote: 'Your arrival is the only gift we wish for. Your presence is our joy.',
    footerAddr: 'Malenada Nilaya, Sri Mahalakshmi Drushti Enclave, J.P. Nagar, Mysuru',
    musicPrompt: 'Tap to play music',
    musicPlay: 'Play music', musicPause: 'Pause music'
  },
  kn: {
    skipLink: 'ಆಹ್ವಾನಕ್ಕೆ ನೇರವಾಗಿ ಹೋಗಿ',
    envInvited: 'ನಿಮಗೆ ಆದರದ ಆಹ್ವಾನ',
    envTap: 'ತೆರೆಯಲು ಮುದ್ರೆಯನ್ನು ಸ್ಪರ್ಶಿಸಿ',
    heroPre: 'ದಿ॥ ಶ್ರೀಮತಿ ಗಂಗಮ್ಮ ಮತ್ತು ದಿ॥ ಶ್ರೀ ಮುತ್ತಯ್ಯ ಇವರ ಕೃಪಾಶೀರ್ವಾದಗಳೊಂದಿಗೆ',
    heroPost: 'ನಿಮಗೂ ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬದವರಿಗೂ ಆತ್ಮೀಯ ಆಹ್ವಾನ',
    heroDay: 'ನವೆಂಬರ್',
    heroMonth: '2026',
    heroVenue: 'ಮಾಧವ ಮಂಗಲ ಸಮುದಾಯ ಭವನ, ಶಿವಮೊಗ್ಗ',
    cdDays: 'ದಿನ', cdHours: 'ಗಂಟೆ', cdMins: 'ನಿಮಿಷ', cdSecs: 'ಸೆಕೆಂಡು',
    cdDone: 'ನಮ್ಮೊಂದಿಗೆ ಸಂಭ್ರಮಿಸಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು',
    scrollCue: 'ಮುಂದೆ',

    verseText: 'ಮನುಷ್ಯನ ಜೀವಿತ ಕಾಲವೇ ಒಂದು ಸುಮುಹೂರ್ತ\nವಿವಾಹವು ನಡೆಯುವ ಹಾದಿಯೇ ಹೊರತು ಸೇರುವ ಮನೆಯಲ್ಲ\nಗಂಡ ಹೆಂಡಿರನ್ನು ಒಟ್ಟಿಗೆ ಬದುಕುವಂತೆ ಮಾಡುವ ಸಾಧನ ಪ್ರೀತಿಯೊಂದೇ\n(ಪ್ರೀತಿಯೇ ಬಂಧನ)',
    verseBy: '— ರಾಷ್ಟ್ರಕವಿ ಕುವೆಂಪು',

    coupleEyebrow: 'ಎರಡು ಮನಸ್ಸು, ಒಂದೇ ಪಯಣ',
    couplePoem: 'ಎರಡು ಮನಸುಗಳು ಒಂದಾಗಿ,\nಎರಡು ಕುಟುಂಬಗಳು ಒಂದಾಗುವ ಶುಭ ಸಂಭ್ರಮಕ್ಕೆ\nಹಾಗು ಸಪ್ತಪದಿಯೊಂದಿಗೆ ಜೊತೆಯಾಗಿ ನಡೆಯುವ\nನಮ್ಮ ಹೊಸ ಪಯಣಕ್ಕೆ ನಿಮ್ಮ ಶುಭ ಹಾರೈಕೆ ಇರಲಿ.',
    groomRole: 'ವರ',
    brideRole: 'ವಧು',
    groomAlt: 'ವರ ನಿತಿನ್ ಅವರ ಭಾವಚಿತ್ರ',
    brideAlt: 'ವಧು ಅಮೂಲ್ಯ ಅವರ ಭಾವಚಿತ್ರ',
    groomBio: 'ಬಿ.ಇ. (ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್)',
    brideBio: 'ಬಿ.ಇ. (ಸಿವಿಲ್)',
    groomParents: 'ಶ್ರೀಮತಿ ಯಶೋದ ಮತ್ತು ಶ್ರೀ ವೆಂಕಟೇಶ್ (ನಿವೃತ್ತ ಬಿ.ಎಸ್.ಎಫ್.), ಮೈಸೂರು ಇವರ ಜ್ಯೇಷ್ಠ ಪುತ್ರ',
    brideParents: 'ಶ್ರೀಮತಿ ಶ್ರೀದೇವಿ ಮತ್ತು ಶ್ರೀ ಶರಣಪ್ಪ ಓಲೇಕಾರ (ನಿವೃತ್ತ ಕೃಷಿ ಅಧಿಕಾರಿ, ಕೃಷಿ ಇಲಾಖೆ), ಶಿವಮೊಗ್ಗ ಇವರ ಜ್ಯೇಷ್ಠ ಪುತ್ರಿ',

    eventsEyebrow: 'ನಮ್ಮೊಂದಿಗೆ ಸಂಭ್ರಮಿಸಿ',
    rcDate: 'ಬುಧವಾರ, 18 ನವೆಂಬರ್ 2026', rcTime: 'ಸಂಜೆ 7:30ಕ್ಕೆ',
    muDate: 'ಗುರುವಾರ, 19 ನವೆಂಬರ್ 2026', muTime: 'ಬೆಳಿಗ್ಗೆ 9:30 ರಿಂದ 10:30 ರವರೆಗೆ', muLagna: 'ಲಗ್ನ: ಧನುರ್',
    muNote: 'ಶ್ರೀ ಪರಾಭವನಾಮ ಸಂವತ್ಸರ · ದಕ್ಷಿಣಾಯನ · ಶರದೃತು · ಕಾರ್ತಿಕ ಮಾಸ · ಶುಕ್ಲ ಪಕ್ಷ ದಶಮಿ',
    evVenue: 'ಮಾಧವ ಮಂಗಲ ಸಮುದಾಯ ಭವನ, ಶಿವಮೊಗ್ಗ',

    venueEyebrow: 'ಮನಸುಗಳು ಒಂದಾಗುವ ತಾಣ',
    venueAddr: 'ಡೆಲ್ಲಿ ವರ್ಲ್ಡ್ ಸ್ಕೂಲ್ ಹತ್ತಿರ, ಮಲ್ಲಿಗೆನಹಳ್ಳಿ, ಸಾಗರ ರಸ್ತೆ, ಶಿವಮೊಗ್ಗ',
    venueNote: 'ಆರತಕ್ಷತೆ ಮತ್ತು ಧಾರಾಮುಹೂರ್ತ ಎರಡೂ ಇಲ್ಲಿಯೇ',
    mapsBtn: 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ',
    calBtn: 'ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ',

    galleryEyebrow: 'ಚಿತ್ರಗಳಲ್ಲಿ ನಮ್ಮ ಕಥೆ',
    galleryHint: 'ಸರಿಸಿ ಅಥವಾ ಚಿತ್ರ ಸ್ಪರ್ಶಿಸಿ',
    galPrev: 'ಹಿಂದಿನ ಚಿತ್ರ', galNext: 'ಮುಂದಿನ ಚಿತ್ರ', lbClose: 'ಮುಚ್ಚಿ',

    rsvpEyebrow: 'ದಯವಿಟ್ಟು ತಿಳಿಸಿ',
    rsvpText: 'ಈ ಶುಭ ಸಂದರ್ಭದಲ್ಲಿ ನಮ್ಮ ಮಕ್ಕಳ ವಿವಾಹ ಮಹೋತ್ಸವಕ್ಕೆ ತಾವು ಕುಟುಂಬ ಸಮೇತರಾಗಿ ಆಗಮಿಸಿ, ನವಜೋಡಿಗೆ ಶುಭ ಹಾರೈಸಿ, ತಮ್ಮ ಆಶೀರ್ವಾದವನ್ನು ನೀಡಬೇಕೆಂದು ಪ್ರೀತಿಪೂರ್ವಕವಾಗಿ ಆಹ್ವಾನಿಸುತ್ತೇವೆ.',
    rsvpBtn: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಉತ್ತರಿಸಿ',
    rsvpMsg: 'ನಮಸ್ಕಾರ! ನಿತಿನ್ ಮತ್ತು ಅಮೂಲ್ಯ ಅವರ ವಿವಾಹಕ್ಕೆ (18 ನವೆಂಬರ್ ಆರತಕ್ಷತೆ, 19 ನವೆಂಬರ್ 2026 ಧಾರಾಮುಹೂರ್ತ) ಬರಲು ಸಂತೋಷಪಡುತ್ತೇನೆ.\nಹೆಸರು: \nಅತಿಥಿಗಳ ಸಂಖ್ಯೆ: ',

    familiesEyebrow: 'ಎರಡೂ ಕುಟುಂಬಗಳ ಪರವಾಗಿ',
    groomSide: 'ವರನ ಕಡೆಯಿಂದ',
    brideSide: 'ವಧುವಿನ ಕಡೆಯಿಂದ',
    wishersTitle: 'ತಮ್ಮ ಸುಖಾಗಮನವನ್ನು ಬಯಸುವವರು',

    footerNote: 'ತಮ್ಮ ಆಗಮನವನ್ನೇ ಉಡುಗೊರೆಯೆಂದು ಭಾವಿಸುತ್ತೇವೆ. ನಿಮ್ಮ ಉಪಸ್ಥಿತಿಯೇ ನಮ್ಮ ಸಂತೋಷ.',
    footerAddr: 'ಮಲೆನಾಡ ನಿಲಯ, ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ದೃಷ್ಟಿ ಎನ್‌ಕ್ಲೇವ್, ಜೆ. ಪಿ. ನಗರ, ಮೈಸೂರು',
    musicPrompt: 'ಸಂಗೀತ ಕೇಳಲು ಸ್ಪರ್ಶಿಸಿ',
    musicPlay: 'ಸಂಗೀತ ಆರಂಭಿಸಿ', musicPause: 'ಸಂಗೀತ ನಿಲ್ಲಿಸಿ'
  }
};
