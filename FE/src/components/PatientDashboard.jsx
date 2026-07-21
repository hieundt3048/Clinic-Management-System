import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  BeakerIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  DocumentTextIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const quickActions = [
  {
    title: 'Đặt lịch khám',
    text: 'Chọn chuyên khoa, bác sĩ và khung giờ phù hợp để gửi lịch hẹn mới.',
    href: '/appointments',
    icon: CalendarDaysIcon,
    tone: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  {
    title: 'Thông báo lịch hẹn',
    text: 'Theo dõi lịch khám sắp tới và các lịch tái khám được bác sĩ đề xuất.',
    href: '/appointment-notifications',
    icon: BellAlertIcon,
    tone: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  {
    title: 'Hồ sơ sức khỏe',
    text: 'Xem thông tin cá nhân, bệnh án, đơn thuốc, kết quả cận lâm sàng và chỉ số gần nhất.',
    href: '/health-profile',
    icon: UserCircleIcon,
    tone: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  {
    title: 'Theo dõi sức khỏe',
    text: 'Xem huyết áp, nhịp tim, cân nặng, đường huyết, SpO2 do bác sĩ ghi nhận và theo dõi xu hướng.',
    href: '/health-tracking',
    icon: ChartBarIcon,
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  {
    title: 'Nhắc uống thuốc',
    text: 'Tạo lịch nhắc theo đơn thuốc để không bỏ lỡ thời điểm dùng thuốc quan trọng.',
    href: '/medication-reminder',
    icon: HeartIcon,
    tone: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  {
    title: 'Thanh toán viện phí',
    text: 'Xem hóa đơn, trạng thái thanh toán và xử lý các khoản phí khám bệnh.',
    href: '/billing',
    icon: CreditCardIcon,
    tone: 'bg-violet-50 text-violet-700 border-violet-100',
  },
];

const recordItems = [
  { title: 'Lịch sử đặt khám', text: 'Xem lại các lần đặt lịch, trạng thái lịch hẹn và thông tin buổi khám.', href: '/appointment-history', icon: ClipboardDocumentListIcon },
  { title: 'Lịch sử bệnh án', text: 'Theo dõi chẩn đoán, hướng điều trị và ngày tái khám sau mỗi lần khám.', href: '/medical-history', icon: ShieldCheckIcon },
  { title: 'Đơn thuốc', text: 'Xem thuốc, liều dùng, tần suất và số ngày dùng theo chỉ định của bác sĩ.', href: '/prescriptions', icon: DocumentTextIcon },
  { title: 'Kết quả xét nghiệm', text: 'Kiểm tra chỉ định cận lâm sàng, trạng thái thực hiện và kết quả được cập nhật.', href: '/test-results', icon: BeakerIcon },
];

const careSteps = [
  'Đặt lịch khám với chuyên khoa phù hợp',
  'Nhận thông báo lịch hẹn và lịch tái khám',
  'Bác sĩ cập nhật bệnh án, đơn thuốc và chỉ định CLS',
  'Theo dõi kết quả, thanh toán và chăm sóc sức khỏe tại nhà',
];

const FeatureCard = ({ item }) => {
  const Icon = item.icon;
  return (
    <Link
      to={item.href}
      className="group rounded-xl border border-sky-200 bg-sky-50/90 p-4 shadow-md shadow-sky-100 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className={'rounded-xl border p-2.5 ' + item.tone}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
            <ArrowRightIcon className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-blue-600" />
          </div>
          <p className="mt-1.5 text-sm leading-6 text-gray-500">{item.text}</p>
        </div>
      </div>
    </Link>
  );
};

const RecordLink = ({ item }) => {
  const Icon = item.icon;
  return (
    <Link to={item.href} className="flex gap-3 rounded-lg border border-sky-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-cyan-50">
      <div className="h-fit rounded-lg bg-gray-50 p-2">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{item.title}</p>
        <p className="mt-1 text-sm leading-6 text-gray-500">{item.text}</p>
      </div>
    </Link>
  );
};
const PatientDashboard = ({ user }) => {
  const displayName = user?.name && user.name !== user.email ? user.name : 'bạn';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 text-white shadow-sm">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:px-8">
            <div className="flex flex-col justify-center">
              <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-blue-50">
                <SparklesIcon className="h-4 w-4" />
                Trung tâm chăm sóc cá nhân của bệnh nhân
              </div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
                Xin chào {displayName}, hôm nay mình cùng chăm sóc sức khỏe gọn gàng hơn.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                Từ đặt lịch khám, nhận nhắc tái khám, theo dõi chỉ số sức khỏe đến xem đơn thuốc và thanh toán viện phí, mọi thao tác quan trọng của bệnh nhân được gom vào một nơi dễ theo dõi.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/appointments" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50">
                  Đặt lịch khám
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link to="/health-profile" className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/20">
                  Xem hồ sơ sức khỏe
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/15 p-5 backdrop-blur-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/15 p-4">
                  <CalendarDaysIcon className="h-7 w-7 text-blue-50" />
                  <p className="mt-3 text-2xl font-bold">6+</p>
                  <p className="text-sm text-blue-50">luồng chăm sóc đã sẵn sàng</p>
                </div>
                <div className="rounded-xl bg-white/15 p-4">
                  <HeartIcon className="h-7 w-7 text-blue-50" />
                  <p className="mt-3 text-2xl font-bold">24/7</p>
                  <p className="text-sm text-blue-50">truy cập hồ sơ và lịch sử</p>
                </div>
                <div className="rounded-xl bg-white/15 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-50">Nên làm tiếp</p>
                  <p className="mt-2 text-sm leading-6 text-white">Cập nhật hồ sơ cá nhân, xem chỉ số sức khỏe gần nhất và kiểm tra lịch tái khám để nắm rõ quá trình theo dõi.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bạn có thể làm gì trên hệ thống?</h2>
              <p className="text-sm text-gray-500">Các chức năng chính dành cho bệnh nhân, được sắp theo việc thường dùng nhất.</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((item) => <FeatureCard key={item.href} item={item} />)}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Theo dõi sau khi khám</h2>
                <p className="mt-1 text-sm text-gray-500">Những dữ liệu bác sĩ cập nhật sau buổi khám sẽ nằm trong các mục dưới đây.</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-2">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {recordItems.map((item) => <RecordLink key={item.href} item={item} />)}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-2xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <h2 className="text-base font-bold text-gray-900">Quy trình chăm sóc</h2>
              </div>
              <div className="mt-4 space-y-3">
                {careSteps.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{index + 1}</div>
                    <p className="pt-1 text-sm leading-6 text-gray-600">{step}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-center gap-2">
                <BellAlertIcon className="h-5 w-5 text-blue-700" />
                <h2 className="text-base font-bold text-gray-900">Gợi ý hôm nay</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" />Kiểm tra thông báo lịch hẹn để không bỏ lỡ lịch tái khám.</li>
                <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" />Theo dõi chỉ số sức khỏe đã được bác sĩ ghi nhận nếu bạn đang cần kiểm soát huyết áp, đường huyết hoặc cân nặng.</li>
                <li className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 rounded-full bg-blue-600" />Xem hóa đơn để hoàn tất các khoản cần thanh toán.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;