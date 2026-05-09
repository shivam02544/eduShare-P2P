import React from 'react';

export const metadata = {
  title: "DMCA Policy | EduShare",
  description: "EduShare's procedures for handling copyright infringement notifications.",
};

export default function DMCAPage() {
  const lastUpdated = "May 9, 2026";

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">DMCA Policy</h1>
        <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
      </header>

      <section className="prose prose-invert max-w-none space-y-8">
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Copyright Policy</h2>
          <p className="text-text-2 leading-relaxed">
            EduShare respects the intellectual property rights of others and expects its users to do the same. 
            In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously 
            to claims of copyright infringement committed using the EduShare platform.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">1. Filing a Notice</h2>
          <p className="text-text-2 leading-relaxed">
            If you are a copyright owner or authorized to act on behalf of one, please report alleged copyright 
            infringements by completing a DMCA Notice of Alleged Infringement and delivering it to our designated agent. 
            Your notice must include:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-2">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing and where it is located on the platform.</li>
            <li>Your contact information (address, telephone number, and email).</li>
            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
            <li>A statement that the information in the notification is accurate, under penalty of perjury.</li>
            <li>A physical or electronic signature of the copyright owner or their authorized representative.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">2. Counter-Notification</h2>
          <p className="text-text-2 leading-relaxed">
            If you believe your content was removed by mistake or misidentification, you may submit a counter-notification 
            containing:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-text-2">
            <li>Identification of the material that was removed and its previous location.</li>
            <li>A statement under penalty of perjury that you have a good faith belief the material was removed in error.</li>
            <li>Your name, address, and telephone number.</li>
            <li>A statement consenting to the jurisdiction of the federal district court for the judicial district in which your address is located.</li>
            <li>Your physical or electronic signature.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">3. Repeat Infringer Policy</h2>
          <p className="text-text-2 leading-relaxed">
            EduShare maintains a "repeat infringer" policy. We reserve the right to terminate the accounts of users 
            who are repeatedly found to be infringing the intellectual property rights of others.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold border-b border-border pb-2">4. Designated Agent</h2>
          <p className="text-text-2 leading-relaxed">
            Please send all DMCA notices to:<br />
            <strong>EduShare Copyright Agent</strong><br />
            Email: dmca@edushare.com<br />
            Address: [Your Company Address Here]
          </p>
        </div>
      </section>
    </div>
  );
}
