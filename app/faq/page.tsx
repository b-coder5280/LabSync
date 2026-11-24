import { PublicPage } from '@/components/PublicPage';
import { faqSchema, faqs } from '@/lib/public-content';
import { publicPageMetadata, structuredData } from '@/lib/seo';

export const metadata = publicPageMetadata('/faq', '자주 묻는 질문 | LabSync', 'Google Calendar 유지, LabSync 무료 데모, 가입 초대와 6주 파일럿의 자주 묻는 질문입니다.');

export default function Faq() {
  return <PublicPage title="자주 묻는 질문">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData({ '@context': 'https://schema.org', ...faqSchema() }) }} />
    {faqs.map(([question, answer]) => <section key={question}><h2>{question}</h2><p>{answer}</p></section>)}
  </PublicPage>;
}
