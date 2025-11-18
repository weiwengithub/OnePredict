import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogProps {
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

// 创建 Context 来传递动画状态
const DialogContext = React.createContext<{ isVisible: boolean }>({ isVisible: false });

const Dialog: React.FC<DialogProps> = ({ className = '', open, onOpenChange, children }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(open);

  React.useEffect(() => {
    if (open) {
      setShouldRender(true);
      // 延迟一帧，确保DOM已渲染再添加动画类
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      // 等待动画结束后再卸载组件
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // 与动画时长一致
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!shouldRender) return null;

  return (
    <DialogContext.Provider value={{ isVisible }}>
      <div className={cn("fixed h-screen inset-0 z-20", className)}>
        <div
          className={cn(
            "h-full inset-0 bg-black/50 transition-opacity duration-300",
            isVisible ? "opacity-100" : "opacity-0"
          )}
          onClick={() => onOpenChange?.(false)}
        />
        {children}
      </div>
    </DialogContext.Provider>
  );
};

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { isVisible } = React.useContext(DialogContext);

  // 检查是否是移动端底部弹窗（包含 bottom-0 且不包含 translate-y-[-50%]）
  const isMobileBottomSheet = className?.includes("bottom-0") && !className?.includes("translate-y-[-50%]");

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 bg-background p-6 shadow-lg border",
        "transition-all duration-300 ease-out",
        // 默认居中定位（仅当不是移动端底部弹窗时）
        !isMobileBottomSheet && "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        // PC端：缩放 + 透明度动画（居中弹窗）
        !isMobileBottomSheet && (
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90"
        ),
        // 移动端底部弹窗：滑入 + 透明度动画
        isMobileBottomSheet && (
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-full"
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
DialogContent.displayName = "DialogContent";

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export { Dialog, DialogContent, DialogHeader, DialogTitle };
