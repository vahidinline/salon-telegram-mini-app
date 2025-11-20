import { FC, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Service {
  serviceFeatures?: string[];
}

interface Props {
  service: Service;
}

const ServiceFeaturesAccordion: FC<Props> = ({ service }) => {
  const [open, setOpen] = useState<boolean>(false);

  if (!service?.serviceFeatures || service.serviceFeatures.length === 0)
    return null;

  return (
    <div className="w-full">
      {/* Header */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between bg-transparent border my-3 px-3 py-2 rounded-lg">
        <p className="text-xs font-semibold text-gray-800">
          خدمات و متریال مصرفی
        </p>

        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Accordion Body */}
      <div
        className={`transition-all overflow-hidden duration-300 ${
          open ? 'max-h-96 mt-2' : 'max-h-0'
        }`}>
        <ul className="text-sm text-gray-600 mb-3 list-disc pr-5 space-y-1">
          {service.serviceFeatures.map((feature: string, index: number) => (
            <li
              key={index}
              className="list-image-[url(/src/assets/img/check.png)]">
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServiceFeaturesAccordion;
