
import { MarketOption } from "@/lib/api/interface";
import { HoverTooltipButton } from "@/components/HoverTooltipButton";
import EllipsisWithTooltip from "@/components/EllipsisWithTooltip";
import { colors } from "@/assets/config";
import {useLanguage} from "@/contexts/LanguageContext";


interface CustomCarouselProps {
  prediction: MarketOption;
  clickFn: (e: React.MouseEvent, idx: number) => void;
  onHover?: (idx: number | null) => void; // 鼠标悬停项
}
const Outcomes = ({
  prediction,
  clickFn,
  onHover
}:CustomCarouselProps) => {
  const { t } = useLanguage();

  if (prediction.outcome.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-[9px] mb-[12px]">
        {prediction.outcome.map((outcome, index) => (
          <HoverTooltipButton
            key={index}
            label={outcome.name}
            hoverLabel={`${(100 * Number(outcome.prob)).toFixed(2)}%`}
            tooltip={
              <>
                To win: {outcome.roi} x
              </>
            }
            onClick={(e: React.MouseEvent) => clickFn(e,index)}
            onMouseOver={() => (typeof onHover === 'function' ? onHover(index) : null)}
            onMouseLeave={() => (typeof onHover === 'function' ? onHover(null) : null)}
            color={colors[index]}
            buttonProps={{ variant: "outline" }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mb-[12px] w-full h-[96px] space-y-[12px] pr-[6px] overflow-x-hidden overflow-y-auto scrollbar-custom">
      {prediction.outcome.map((outcome, index) => (
        <div key={index} className="h-[24px] flex gap-[24px]">
          <EllipsisWithTooltip
            text={outcome.name}
            className="flex-1 h-[24px] leading-[24px] text-white text-[16px] font-bold"
          />
          <div className="h-[24px] leading-[24px] text-white/80 text-[16px]">{`${(100 * Number(outcome.prob)).toFixed(2)}%`}</div>
          <HoverTooltipButton
            key={index}
            label={t('common.buy')}
            hoverLabel={t('common.buy')}
            tooltip={
              <>
                To win: {outcome.roi} x
              </>
            }
            onClick={(e: React.MouseEvent) => clickFn(e,index)}
            onMouseOver={() => (typeof onHover === 'function' ? onHover(index) : null)}
            onMouseLeave={() => (typeof onHover === 'function' ? onHover(null) : null)}
            color={colors[index % colors.length]}
            className="h-[24px] w-auto text-[14px] px-2"
            buttonProps={{ variant: "outline" }}
          />
        </div>
      ))}
    </div>
  )
}

export default Outcomes;
