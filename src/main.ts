import { ClassEvent, classHourType } from "./types";


const classTime = {
    "1": "09:00:00-10:30:00",
    "2": "10:40:00-12:10:00",
    "3": "13:00:00-14:30:00",
    "4": "14:40:00-16:10:00",
    "5": "16:20:00-17:50:00",
    "6": "18:00:00-19:30:00"
};
const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"];


const nextDayOfDate = (day: string): Date => {
    if (!dayOfWeek.includes(day)) throw new Error;
    const now = new Date();
    const nowDayStr = dayOfWeek[now.getDay()];
    if (nowDayStr == day) return now;

    const nextDate = new Date();
    while (true) {
        if (dayOfWeek[nextDate.getDay()] == day) return nextDate;
        nextDate.setDate(nextDate.getDate() + 1);
    }
}

const classDateTime = (day: string, hour: classHourType) => {
    const startDate = nextDayOfDate(day);
    const endDate = new Date(startDate.getTime());
    const classHour = classTime[hour];
    const startTime = classHour.split("-")[0];
    const endTime = classHour.split("-")[1];
    startDate.setHours(
        Number(startTime.split(":")[0]),
        Number(startTime.split(":")[1]),
        Number(startTime.split(":")[2])
    );
    endDate.setHours(
        Number(endTime.split(":")[0]),
        Number(endTime.split(":")[1]),
        Number(endTime.split(":")[2])
    );
    const startDateTime = startDate.toISOString().slice(0, -5) + "+09:00";
    const endDateTime = endDate.toISOString().slice(0, -5) + "+09:00";
    return [startDateTime, endDateTime];
}

const fetchClassData = async () => {
    const events: ClassEvent[] = [];

    const lessonList = document.querySelector("div#portalLessonList") ;
    const matches = lessonList?.querySelectorAll("li.ui-datalist-item");

    if (!matches) {
        console.error("情報を取得できませんでした。");
        return events;
    }

    matches.forEach(item => {
        // const [day, hour] = [...new Set(item.querySelector("span.period")?.textContent?.split(" "))];
        const dayWithHour = item.querySelectorAll("span.period");

        dayWithHour.forEach(it=>{
            const [day, hour] = [...it!.textContent!.split(" ")];
            const [startDateTime, endDateTime] = classDateTime(day, hour as classHourType);
            events.push({
                summary: item.querySelector("p.lessonTitle")?.textContent?.replace(/(\n|\t)/g, "") ?? "",
                location: item.querySelector('div.lessonMain')?.children[1]?.children[1]?.textContent?.replace(/(\n|\t)/g, "") ?? "",
                description: item.querySelector("div.lessonDetail")?.children[0]?.textContent?.replace(/(\n|\t)/g, "") ?? "",
                start: {
                    dateTime: startDateTime,
                    timeZone: 'Asia/Tokyo'
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: 'Asia/Tokyo'
                },
                meta: {
                    day: day,
                    period: hour
                }
            })
        })
    });

    return events;
}


const exportRegisterGoogleCalendarLink = (events: ClassEvent[]) => {
    if (document.getElementById("schedule_manager") != null) {
        console.log("すでに実行されています。");
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.setAttribute("id", "schedule_manager");
    wrapper.innerHTML = "<h2><span class='span'>カレンダー登録リンク</span></h2>"
    const ul = document.createElement("ul");

    const content = document.createElement("div");
    content.className = "portalSubDetail linkArea";

    events.forEach(it => {
        const convertTime = (time: string) => {
            const yyyyMMdd = time.split("T")[0].split("-").join("");
            const hours = (time.split("T")[1].split("+")[0].split(":").map(it => it.padStart(2, "0")).join(""));
            return `${yyyyMMdd}T${hours}Z`;
        }

        const startTime = convertTime(it.start.dateTime);
        const endTime = convertTime(it.end.dateTime);

        const li = document.createElement("li");
        li.innerHTML = "<span class='fa fa-fw fa-external-link iconSizeLM'></span>";
        li.style.margin = "8px"
        const link = document.createElement("a");
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.href = `https://www.google.com/calendar/render?action=TEMPLATE&text=${it.summary}&dates=${startTime}/${endTime}&details=${it.description}&location=${it.location}&trp=false`;
        link.textContent = `「${it.summary}（${it.meta.day} ${it.meta.period}）」`;
        li.appendChild(link);
        ul.appendChild(li);
    })

    content.appendChild(ul);
    wrapper.appendChild(content);
    const appendArea = document.querySelector("div.portalSub") ?? document.body;
    appendArea.appendChild(wrapper);
}

chrome.runtime.onMessage.addListener(async (request, options) => {
    if (request == "clickAction") {
        const events = await fetchClassData();
        exportRegisterGoogleCalendarLink(events);
    }
    return true;
})


const main = async () => {
    const events = await fetchClassData();
    exportRegisterGoogleCalendarLink(events);
}

main();