import { Badge } from "~/components/ui/badge";
import { CheckCircle, Shield, Award, Clock } from "lucide-react";

type Driver = {
  name: string;
  role: string;
  image: string;
  experience: string;
  specialization: string;
};

const drivers: Driver[] = [
  {
    name: "Jiro Gonzales",
    role: "Senior Driver",
    image: "/drivers/jiro.jpg",
    experience: "10+ Years",
    specialization: "Fleet Coordinator",
  },
  {
    name: "Jenah Ambagan",
    role: "Professional Driver",
    image: "/drivers/jenah.jpg",
    experience: "10+ Years",
    specialization: "Safety Specialist",
  },
  {
    name: "Joyce Manaloto",
    role: "Professional Driver",
    image: "/drivers/joyce.jpg",
    experience: "8+ Years",
    specialization: "Route Expert",
  },
  {
    name: "Venice Bumagat",
    role: "Professional Driver",
    image: "/drivers/venice.jpg",
    experience: "8+ Years",
    specialization: "Customer Care",
  },
];

export function Drivers() {
  return (
    <section
      id="drivers"
      className="from-background via-primary/5 to-background bg-gradient-to-b px-4 py-24 sm:px-6"
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-20 space-y-6 text-center">
          <div className="flex justify-center">
            <div className="via-secondary h-1 w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>

          <Badge className="bg-secondary border-secondary mx-auto w-fit rounded-full border-2 px-5 py-1.5 text-xs font-bold tracking-widest text-blue-900 uppercase shadow-lg">
            Our Team
          </Badge>

          <div className="space-y-4">
            <h2 className="text-secondary text-4xl leading-tight font-black tracking-tighter md:text-5xl">
              Professional Drivers
            </h2>
            <p className="text-foreground/80 mx-auto max-w-3xl text-lg leading-relaxed font-medium md:text-xl">
              Meet the dedicated professionals who ensure safe and comfortable
              transportation for our Holy Cross College community.
            </p>
          </div>

          <div className="flex justify-center pt-2">
            <div className="via-secondary h-1 w-16 bg-gradient-to-r from-transparent to-transparent" />
          </div>
        </div>

        {/* Drivers Grid - All Uniform */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {drivers.map((driver) => (
            <div key={driver.name} className="group relative">
              <div className="from-secondary/30 to-primary/20 absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 blur transition-all duration-400 group-hover:opacity-100" />
              <div className="from-primary/15 via-primary/5 to-background border-secondary/20 hover:border-secondary/40 relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-8 text-center shadow-lg transition-all duration-400 hover:-translate-y-1 hover:shadow-2xl">
                {/* Avatar */}
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-800">
                  <img
                    src={driver.image}
                    alt={driver.name}
                    className="h-24 w-24 object-cover"
                  />
                </div>

                {/* Driver Info */}
                <h3 className="text-secondary mb-2 text-lg font-bold">
                  {driver.name}
                </h3>
                <p className="text-foreground/80 mb-1 text-sm font-medium">
                  {driver.role}
                </p>
                <p className="text-foreground/60 mb-4 text-xs">
                  {driver.specialization}
                </p>

                {/* Divider */}
                <div className="border-secondary/20 my-4 w-full border-t" />

                {/* Experience */}
                <div className="mb-4 flex-1 space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="text-secondary h-4 w-4" />
                    <span className="text-foreground/70 text-sm font-medium">
                      {driver.experience}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-foreground/70 text-xs font-medium">
                      Certified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Commitment Section - Different from Fleet */}
        <div className="group relative">
          <div className="from-secondary/25 via-primary/20 to-secondary/15 absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 blur transition-all duration-400 group-hover:opacity-100" />
          <div className="from-primary/15 via-primary/5 to-background border-secondary/30 hover:border-secondary/50 relative rounded-2xl border-2 bg-gradient-to-br p-8 shadow-xl transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl md:p-12">
            <div className="space-y-8">
              <h3 className="text-secondary text-center text-2xl font-bold md:text-3xl">
                What Our Drivers Stand For
              </h3>

              {/* Values Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/20">
                      <Shield className="h-6 w-6 text-blue-400" />
                    </div>
                    <h4 className="text-secondary text-lg font-bold">
                      Safety First
                    </h4>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    Every journey is planned with utmost care. Our drivers
                    follow strict safety protocols to protect every student.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/20">
                      <Award className="h-6 w-6 text-emerald-400" />
                    </div>
                    <h4 className="text-secondary text-lg font-bold">
                      Professionalism
                    </h4>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    Highly trained and licensed professionals dedicated to
                    excellence in every aspect of transportation.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/20">
                      <CheckCircle className="h-6 w-6 text-purple-400" />
                    </div>
                    <h4 className="text-secondary text-lg font-bold">
                      Reliability
                    </h4>
                  </div>
                  <p className="text-foreground/80 leading-relaxed">
                    On-time, consistent service you can depend on. Your schedule
                    is our priority.
                  </p>
                </div>
              </div>

              {/* Bottom Message */}
              <div className="border-secondary/30 from-secondary/10 rounded-xl border bg-gradient-to-br to-transparent p-6 text-center">
                <p className="text-foreground/90 text-lg font-medium">
                  Our team of {drivers.length} dedicated drivers brings{" "}
                  <span className="text-secondary font-black">
                    36+ years of combined experience
                  </span>{" "}
                  to ensure your child&apos;s safe and comfortable journey every
                  day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
