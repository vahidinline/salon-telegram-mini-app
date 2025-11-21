import React from 'react';
import { TimeSlot } from '../types';
import dayjs from 'dayjs';
import { convertToPersianNumber } from '../utils/NumberFarsi';

interface SlotCardProps {
  slot: TimeSlot;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  selected,
  onSelect,
  disabled = false,
}) => {
  const startTime = dayjs(slot.start).format('HH:mm');
  const endTime = dayjs(slot.end).format('HH:mm');

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`
        px-4 py-3 rounded-lg border-2 transition-all duration-200 flex flex-row font-bold
        ${
          selected
            ? 'border-[#7f3d45] bg-blue-50 text-[#7f3d45]'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
        }
        ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer active:scale-95'
        }
      `}>
      <div className="">{convertToPersianNumber(startTime)}</div>
      <div className=" text-gray-500 px-1">تا</div>
      <div className="">{convertToPersianNumber(endTime)}</div>
    </button>
  );
};

export default SlotCard;
