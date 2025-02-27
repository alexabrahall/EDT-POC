import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export function CustomDropdowns({
  currMonth,
  setCurrMonth,
}: {
  currMonth: Date;
  setCurrMonth: (date: Date) => void;
}) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() + i
  );

  const handleMonthChange = (value: string) => {
    const newMonth = new Date(currMonth);
    newMonth.setMonth(months.indexOf(value));
    setCurrMonth(newMonth);
  };

  const handleYearChange = (value: string) => {
    const newMonth = new Date(currMonth);
    newMonth.setFullYear(Number.parseInt(value));
    setCurrMonth(newMonth);
  };

  return (
    <div className="flex space-x-2 p-2">
      <Select
        value={months[currMonth.getMonth()]}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currMonth.getFullYear().toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
