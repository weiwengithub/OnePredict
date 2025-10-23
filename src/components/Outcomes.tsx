
import { MarketOption } from "@/lib/api/interface";
import { HoverTooltipButton } from "@/components/HoverTooltipButton";
import Carousel from "@/components/Carousel";
import { colors } from "@/assets/config";


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
  return (
    <div className="mb-[12px]" style={{ width: "100%" }}>
      <Carousel
        items={prediction.outcome}
        perPage={2}
        autoplay={true}
        onPageChange={() => {}}
        // 将悬停索引透传给父组件
        // 由于 Carousel 目前不支持 onItemHoverChange，直接在按钮级别触发 onHover
        renderButton={(item: any, idx: number) => (
          <HoverTooltipButton
            label={item.name}
            color={colors[idx % colors.length]}
            hoverLabel={`${(100 * Number(item.prob)).toFixed(2)}%`}
            tooltip={
              <>
                To win: {item.roi} x
              </>
            }
            buttonProps={{ variant: "outline" }}
            onClick={(e: React.MouseEvent) => clickFn(e,idx)}
            // 透传悬停索引
            onMouseOver={() => (typeof onHover === 'function' ? onHover(idx) : null)}
            onMouseLeave={() => (typeof onHover === 'function' ? onHover(null) : null)}
          />
        )}
      />
    </div>
  )
}

export default Outcomes;
