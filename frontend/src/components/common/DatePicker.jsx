import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toBanglaNumber } from '../../context/LanguageContext';

const localeData = {
  en: {
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    shortMonths: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    days: ['Su','Mo','Tu','We','Th','Fr','Sa'],
    today: 'Today',
    format: 'en-GB'
  },
  bn: {
    months: ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'],
    shortMonths: ['জানু','ফেব্রু','মার্চ','এপ্রি','মে','জুন','জুলাই','আগস্ট','সেপ্ট','অক্টো','নভে','ডিসে'],
    days: ['রবি','সোম','মঙ্গল','বুধ','বৃহস্পতি','শুক্র','শনি'],
    today: 'আজ',
    format: 'en-GB'
  }
};

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value + (value.includes('T') ? '' : 'T00:00:00'));
  return isNaN(d.getTime()) ? null : d;
}

function formatDateInput(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

const YEAR_RANGE = 12;

export default function DatePicker({ value, onChange, placeholder, language = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(parseDate(value) || new Date());
  const [viewMode, setViewMode] = useState('days');
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const d = parseDate(value) || new Date();
    return d.getFullYear() - YEAR_RANGE;
  });
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const locale = localeData[language] || localeData.en;

  const selectedDate = parseDate(value);

  useEffect(() => {
    setViewDate(parseDate(value) || new Date());
  }, [value]);

  const handleViewDateChange = (newDate) => {
    setViewDate(newDate);
    if (viewMode !== 'days') return;
    const newMonth = newDate.getMonth();
    if (newMonth !== viewDate.getMonth() || newDate.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(newDate);
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewYear, viewMonth + 1, 1));

  const prevYear = () => setViewDate(new Date(viewYear - 1, viewMonth, 1));
  const nextYear = () => setViewDate(new Date(viewYear + 1, viewMonth, 1));

  const prevYearRange = () => setYearRangeStart(s => s - YEAR_RANGE * 2);
  const nextYearRange = () => setYearRangeStart(s => s + YEAR_RANGE * 2);

  const handleSelect = (day) => {
    const selected = new Date(viewYear, viewMonth, day);
    onChange(formatDateInput(selected));
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onChange(formatDateInput(today));
    setViewDate(today);
    setViewMode('days');
    setIsOpen(false);
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    setViewMode('days');
  };

  const displayValue = (() => {
    if (!value) return '';
    const d = parseDate(value);
    if (!d) return value;
    const day = d.getDate();
    const month = locale.shortMonths[d.getMonth()];
    const year = d.getFullYear();
    const str = `${day} ${month} ${year}`;
    return language === 'bn' ? toBanglaNumber(str) : str;
  })();

  const isToday = (day) => {
    const today = new Date();
    return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;
  };

  const isSelected = (day) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth && selectedDate.getDate() === day;
  };

  const handleMonthSelect = (monthIndex) => {
    setViewDate(new Date(viewYear, monthIndex, 1));
    setViewMode('days');
  };

  const handleYearSelect = (year) => {
    setViewDate(new Date(year, viewMonth, 1));
    setViewMode('months');
  };

  const renderDayView = () => (
    <>
      <div className="calendar-weekdays">
        {locale.days.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>
      <div className="calendar-days">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          return (
            <div
              key={day}
              className={`calendar-day ${isToday(day) ? 'today' : ''} ${isSelected(day) ? 'selected' : ''}`}
              onClick={() => handleSelect(day)}
            >
              {language === 'bn' ? toBanglaNumber(String(day)) : day}
            </div>
          );
        })}
      </div>
    </>
  );

  const renderMonthView = () => (
    <div className="calendar-months">
      {locale.months.map((month, i) => (
        <div
          key={month}
          className={`calendar-month ${i === viewMonth ? 'selected' : ''}`}
          onClick={() => handleMonthSelect(i)}
        >
          {month.slice(0, 3)}
        </div>
      ))}
    </div>
  );

  const renderYearView = () => {
    const years = [];
    for (let i = 0; i < YEAR_RANGE * 2; i++) {
      years.push(yearRangeStart + i);
    }
    return (
      <div className="calendar-years">
        {years.map(y => (
          <div
            key={y}
            className={`calendar-year ${y === viewYear ? 'selected' : ''}`}
            onClick={() => handleYearSelect(y)}
          >
            {language === 'bn' ? toBanglaNumber(String(y)) : y}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="date-picker" ref={containerRef}>
      <div className="input-with-icon" onClick={handleInputClick} style={{ cursor: 'pointer' }}>
        <Calendar size={18} className="input-icon" />
        <input
          ref={inputRef}
          type="text"
          className="form-input"
          value={displayValue}
          placeholder={placeholder || ''}
          readOnly
          onClick={handleInputClick}
        />
      </div>
      {isOpen && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button type="button" className="calendar-nav" onClick={viewMode === 'years' ? prevYearRange : viewMode === 'months' ? prevYear : prevMonth} tabIndex={-1}>
              <ChevronLeft size={18} />
            </button>
            <div className="calendar-month-label" style={{ cursor: 'pointer' }} onClick={() => setViewMode(viewMode === 'days' ? 'months' : viewMode === 'months' ? 'years' : 'days')}>
              {viewMode === 'years'
                ? `${yearRangeStart}${language === 'bn' ? ' – ' : ' - '}${yearRangeStart + YEAR_RANGE * 2 - 1}`
                : viewMode === 'months'
                  ? (language === 'bn' ? toBanglaNumber(String(viewYear)) : viewYear)
                  : `${locale.months[viewMonth]} ${language === 'bn' ? toBanglaNumber(String(viewYear)) : viewYear}`
              }
            </div>
            <button type="button" className="calendar-nav" onClick={viewMode === 'years' ? nextYearRange : viewMode === 'months' ? nextYear : nextMonth} tabIndex={-1}>
              <ChevronRight size={18} />
            </button>
          </div>
          {viewMode === 'days' && renderDayView()}
          {viewMode === 'months' && renderMonthView()}
          {viewMode === 'years' && renderYearView()}
          <div className="calendar-footer">
            <button type="button" className="btn btn-sm" onClick={handleToday} tabIndex={-1}>
              {locale.today}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
