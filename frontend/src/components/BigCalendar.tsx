"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState, useEffect } from "react";
import { getUser } from "@/utils/auth";
import { getStudentSchedule, StudentScheduleItem } from "@/services/studentScheduleService";
import { toast } from "react-toastify";

const localizer = momentLocalizer(moment);

// Trích xuất tất cả các tiết học từ lesson_period
const extractPeriodNumbers = (lessonPeriod: string): number[] => {
    if (!lessonPeriod) return [1];
    
    // Xử lý dạng phạm vi "Tiết 1-5" hoặc "Thứ hai:1-5"
    const rangeMatch = lessonPeriod.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        
        // Tạo mảng chứa các số từ start đến end
        const periods = [];
        for (let i = start; i <= end; i++) {
            periods.push(i);
        }
        return periods;
    }
    
    // Xử lý dạng danh sách "Tiết 1,2,3"
    const listMatch = lessonPeriod.match(/(\d+)(?:,\s*(\d+))+/);
    if (listMatch) {
        const periodList = lessonPeriod.match(/\d+/g);
        return periodList ? periodList.map(p => parseInt(p, 10)) : [1];
    }
    
    // Xử lý tiết đơn "Tiết 1" hoặc "Thứ hai:1"
    const singleMatch = lessonPeriod.match(/(\d+)/);
    if (singleMatch) {
        return [parseInt(singleMatch[1], 10)];
    }
    
    return [1]; // Mặc định tiết 1 nếu không tìm thấy
};

// Lấy tiết đầu tiên để sắp xếp
const extractFirstPeriod = (lessonPeriod: string): number => {
    const periods = extractPeriodNumbers(lessonPeriod);
    return periods[0] || 1;
};

// Định dạng hiển thị các tiết học
const formatPeriods = (periodNumbers: number[]): string => {
    if (!periodNumbers || periodNumbers.length === 0) return "1";
    
    // Sắp xếp các tiết học theo thứ tự tăng dần
    const sortedPeriods = [...periodNumbers].sort((a, b) => a - b);
    
    // Biến lưu chuỗi kết quả
    const result: string[] = [];
    
    // Biến đánh dấu bắt đầu của một dãy tiết liên tục
    let start = sortedPeriods[0];
    let prev = start;
    
    // Duyệt qua từng tiết học
    for (let i = 1; i < sortedPeriods.length; i++) {
        const current = sortedPeriods[i];
        
        // Nếu tiết hiện tại không liên tục với tiết trước đó
        if (current !== prev + 1) {
            // Kết thúc dãy tiết liên tục trước đó
            if (start === prev) {
                result.push(`${start}`);
            } else {
                result.push(`${start}-${prev}`);
            }
            
            // Bắt đầu dãy tiết liên tục mới
            start = current;
        }
        
        prev = current;
    }
    
    // Xử lý dãy tiết liên tục cuối cùng
    if (start === prev) {
        result.push(`${start}`);
    } else {
        result.push(`${start}-${prev}`);
    }
    
    return result.join(", ");
};

// Chuyển đổi từ dữ liệu API sang định dạng sự kiện cho calendar
const transformScheduleToEvents = (scheduleItems: StudentScheduleItem[]) => {
    const events: any[] = [];
    
    scheduleItems.forEach(item => {
        // Định nghĩa các giờ học theo tiết
        const periodTimes: { [key: number]: { start: string; end: string } } = {
            1: { start: '07:00', end: '07:45' },
            2: { start: '07:50', end: '08:35' },
            3: { start: '08:40', end: '09:25' },
            4: { start: '09:35', end: '10:20' },
            5: { start: '10:25', end: '11:10' },
            6: { start: '13:00', end: '13:45' },
            7: { start: '13:50', end: '14:35' },
            8: { start: '14:40', end: '15:25' },
            9: { start: '15:35', end: '16:20' },
            10: { start: '16:25', end: '17:10' }
        };

        // Xác định ngày trong tuần
        const dayMapping: { [key: string]: number } = {
            'Thứ hai': 1,
            'Thứ ba': 2,
            'Thứ tư': 3,
            'Thứ năm': 4,
            'Thứ sáu': 5,
            'Thứ bảy': 6,
            'Chủ nhật': 0
        };

        // Lấy ngày hiện tại và điều chỉnh về đầu tuần (Thứ Hai)
        const today = new Date();
        const currentDay = today.getDay(); // 0 = CN, 1 = T2, ...
        const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);

        // Tính ngày cho sự kiện dựa trên day_of_week
        const eventDay = new Date(monday);
        const dayIndex = dayMapping[item.day_of_week];
        if (dayIndex !== undefined) {
            const dayOffset = dayIndex === 0 ? 6 : dayIndex - 1;
            eventDay.setDate(monday.getDate() + dayOffset);
            
            // Lấy tất cả tiết từ lesson_period
            const periodNumbers = extractPeriodNumbers(item.lesson_period);
            
            // Nếu có nhiều tiết liên tục, tạo một sự kiện duy nhất bao gồm tất cả các tiết
            if (periodNumbers.length > 0) {
                const firstPeriod = Math.min(...periodNumbers);
                const lastPeriod = Math.max(...periodNumbers);
                
                // Lấy thời gian bắt đầu và kết thúc
                const startTimeInfo = periodTimes[firstPeriod] || { start: '07:00', end: '07:45' };
                const endTimeInfo = periodTimes[lastPeriod] || { start: '07:00', end: '07:45' };
                
                const [startHours, startMinutes] = startTimeInfo.start.split(':').map(Number);
                const [endHours, endMinutes] = endTimeInfo.end.split(':').map(Number);
                
                const startDate = new Date(eventDay);
                startDate.setHours(startHours, startMinutes, 0);
                
                const endDate = new Date(eventDay);
                endDate.setHours(endHours, endMinutes, 0);
                
                events.push({
                    id: `${item.id}`,
                    title: `${item.subject} (${formatPeriods(periodNumbers)})`,
                    start: startDate,
                    end: endDate,
                    resource: {
                        teacher: item.teacher,
                        room: item.room,
                        subject: item.subject,
                        lesson_period: item.lesson_period,
                        periods: formatPeriods(periodNumbers)
                    }
                });
            }
        }
    });
    
    return events;
};

interface BigCalendarProps {
  scheduleData?: StudentScheduleItem[];
  semester?: number;
  schoolYear?: string;
}

const BigCalendar = ({ scheduleData, semester, schoolYear }: BigCalendarProps) => {
    const [view, setView] = useState<View>(Views.WORK_WEEK);
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const loadSchedule = async () => {
            setLoading(true);
            try {
                // Nếu đã có dữ liệu lịch học từ prop
                if (scheduleData) {
                    const calendarEvents = transformScheduleToEvents(scheduleData);
                    setEvents(calendarEvents);
                    setLoading(false);
                    return;
                }

                // Nếu không, tự tải dữ liệu
                const userData = getUser();
                if (!userData || !userData.student || !userData.student.id) {
                    toast.error("Không tìm thấy thông tin học sinh");
                    setLoading(false);
                    return;
                }

                // Tải lịch học từ API
                const semesterValue = semester || 1;
                const schoolYearValue = schoolYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
                
                const loadedData = await getStudentSchedule(userData.student.id, {
                    semester: semesterValue,
                    school_year: schoolYearValue
                });
                
                const calendarEvents = transformScheduleToEvents(loadedData);
                setEvents(calendarEvents);
            } catch (error) {
                console.error("Không thể tải lịch học:", error);
                toast.error("Không thể tải lịch học, vui lòng thử lại sau");
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [scheduleData, semester, schoolYear]);

    const handleOnViewChange = (selectedView: View) => {
        setView(selectedView);
    };

    const eventStyleGetter = (event: any) => {
        return {
            style: {
                backgroundColor: '#3b82f6',
                borderRadius: '4px',
                color: 'white',
                border: 'none',
                display: 'block'
            }
        };
    };

    const formats = {
        timeGutterFormat: (date: Date) => {
            return moment(date).format('HH:mm');
        },
        eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
            return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
        }
    };

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>;
    }

    return (
        <div className="h-[600px] md:h-[700px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={["work_week", "day"]}
                view={view}
                onView={handleOnViewChange}
                formats={formats}
                eventPropGetter={eventStyleGetter}
                toolbar={true}
                tooltipAccessor={(event) => 
                    `${event.resource.subject}\n` +
                    `Giáo viên: ${event.resource.teacher}\n` +
                    `Phòng: ${event.resource.room || 'Chưa cập nhật'}\n` +
                    `Tiết: ${event.resource.periods}\n` +
                    `${moment(event.start).format('HH:mm')} - ${moment(event.end).format('HH:mm')}`
                }
                messages={{
                    today: 'Hôm nay',
                    previous: 'Trước',
                    next: 'Tiếp',
                    day: 'Ngày',
                    work_week: 'Tuần học'
                }}
                min={new Date(new Date().setHours(7, 0, 0))}
                max={new Date(new Date().setHours(17, 30, 0))}
            />
        </div>
    );
};

export default BigCalendar;
