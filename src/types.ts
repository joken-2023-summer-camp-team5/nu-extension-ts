export type classHourType = "1"|"2"|"3"|"4"|"5"|"6"

export type ClassDate = {
    dateTime: string,
    timeZone: string;
}

export type ClassEvent = {
    summary: string | null;  // 科目名
    location: string | null;  // 場所
    description: string | null;  // 担当先生
    start: ClassDate;
    end: ClassDate;
    meta: {
        day: string,
        period: string
    };
}