import { analyticsFilterSchema } from "../validators/analytics.validator.js";

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + 1);
  return next;
}

function quarterStart(date) {
  const month = date.getMonth();
  const quarterMonth = Math.floor(month / 3) * 3;
  return new Date(date.getFullYear(), quarterMonth, 1);
}

function ageToGroup(age) {
  if (age === null || age === undefined) return "Unknown";
  if (age <= 5) return "0-5";
  if (age <= 12) return "6-12";
  if (age <= 17) return "13-17";
  if (age <= 30) return "18-30";
  if (age <= 45) return "31-45";
  if (age <= 60) return "46-60";
  return "61+";
}

export const analyticsFilterService = {
  parse(query) {
    const parsed = analyticsFilterSchema.parse(query);
    const now = new Date();
    let from = startOfDay(now);
    let to = endOfDay(now);

    switch (parsed.preset) {
      case "yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        from = startOfDay(yesterday);
        to = endOfDay(yesterday);
        break;
      }
      case "this_week": {
        const day = now.getDay() || 7;
        from = startOfDay(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1)));
        to = endOfDay(now);
        break;
      }
      case "last_week": {
        const day = now.getDay() || 7;
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (day - 1));
        from = startOfDay(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() - 7));
        to = startOfDay(weekStart);
        break;
      }
      case "this_month":
        from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        to = endOfDay(now);
        break;
      case "last_month":
        from = startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1));
        to = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
        break;
      case "this_quarter":
        from = startOfDay(quarterStart(now));
        to = endOfDay(now);
        break;
      case "this_year":
        from = startOfDay(new Date(now.getFullYear(), 0, 1));
        to = endOfDay(now);
        break;
      case "custom":
        from = parsed.from ? startOfDay(new Date(parsed.from)) : from;
        to = parsed.to ? endOfDay(new Date(parsed.to)) : to;
        break;
      default:
        break;
    }

    return {
      ...parsed,
      from,
      to,
      ageToGroup,
      previousPeriod: this.getPreviousPeriod(from, to, parsed.comparison),
    };
  },

  getPreviousPeriod(from, to, comparison) {
    if (comparison === "none") return null;
    const duration = to.getTime() - from.getTime();
    if (comparison === "previous_year") {
      return {
        from: new Date(from.getFullYear() - 1, from.getMonth(), from.getDate()),
        to: new Date(to.getFullYear() - 1, to.getMonth(), to.getDate()),
      };
    }
    if (comparison === "previous_month") {
      return {
        from: new Date(from.getFullYear(), from.getMonth() - 1, from.getDate()),
        to: new Date(to.getFullYear(), to.getMonth() - 1, to.getDate()),
      };
    }
    return {
      from: new Date(from.getTime() - duration),
      to: new Date(to.getTime() - duration),
    };
  },
};
