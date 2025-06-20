   import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
    import { getDatabase, ref, push, set, update } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

    // 🔥 Your Firebase Config
    const firebaseConfig = {
      apiKey: "AIzaSyDFHskUWiyHhZke3KT9kkOtFI_gPsKfiGo",
      authDomain: "itzhoyoo-f9f7e.firebaseapp.com",
      databaseURL: "https://itzhoyoo-f9f7e-default-rtdb.firebaseio.com",
      projectId: "itzhoyoo-f9f7e",
      storageBucket: "itzhoyoo-f9f7e.filestorage.app",
      messagingSenderId: "1094792075584",
      appId: "1:1094792075584:web:d49e9c3f899d3cd31082a5",
      measurementId: "G-LLT6F9WRKH"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    let clicks = 0;
    let sessionStart = Date.now();
    let sessionKey = null;
    let ipInfo = {};
    const params = new URLSearchParams(window.location.search);

    // 📌 Visitor ID (stored in browser)
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = 'v_' + Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem("visitorId", visitorId);
    }

    document.addEventListener('click', () => clicks++);

    function getDeviceInfo() {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        memory: navigator.deviceMemory || null,
        cores: navigator.hardwareConcurrency || null,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        }
      };
    }

    function getNetworkInfo() {
      const conn = navigator.connection || {};
      return {
        effectiveType: conn.effectiveType || null,
        downlink: conn.downlink || null,
        rtt: conn.rtt || null,
        saveData: conn.saveData || false
      };
    }

    async function fetchIPInfo() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        return {
          ip: data.ip || null,
          country: data.country_name || null,
          region: data.region || null,
          city: data.city || null,
          zip: data.postal || null,
          lat: data.latitude || null,
          lon: data.longitude || null,
          timezone: data.timezone || null,
          isp: data.org || null
        };
      } catch (err) {
        console.warn("IP API failed:", err);
        return {};
      }
    }

    async function sendSessionData(isInit = false) {
      const now = Date.now();
      const sessionData = {
        timestamp: sessionStart,
        lastUpdate: now,
        sessionSeconds: Math.floor((now - sessionStart) / 1000),
        clicks,
        visitorId,
        utm: {
          source: params.get("source") || null,
          campaign: params.get("campaign") || null,
          medium: params.get("medium") || null
        },
        referrer: document.referrer || null,
        page: {
          domain: window.location.hostname,
          path: window.location.pathname,
          fullUrl: window.location.href
        },
        device: getDeviceInfo(),
        network: getNetworkInfo(),
        ...ipInfo
      };

      if (isInit) {
        const newRef = push(ref(db, "userSessions"));
        sessionKey = newRef.key;
        await set(newRef, sessionData);
      } else if (sessionKey) {
        await update(ref(db, `userSessions/${sessionKey}`), sessionData);
      }
    }

    async function initTracker() {
      ipInfo = await fetchIPInfo();
      await sendSessionData(true);
      setInterval(() => sendSessionData(false), 15000);

      window.addEventListener("beforeunload", () => {
        const now = Date.now();
        const beaconData = {
          clicks,
          sessionSeconds: Math.floor((now - sessionStart) / 1000),
          lastUpdate: now
        };
        navigator.sendBeacon(
          `https://itzhoyoo-f9f7e-default-rtdb.firebaseio.com/userSessions/${sessionKey}.json`,
          JSON.stringify(beaconData)
        );
      });
    }

    initTracker();