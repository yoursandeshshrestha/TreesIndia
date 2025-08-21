import { HelpCircle, BookOpen } from "lucide-react";
import Button from "../Button/Base/Button";

interface CommonFooterProps {
  className?: string;
  helpText: string;
  buttons: {
    text: string;
    link: string;
    type: "docs" | "support";
  }[];
}

function CommonFooter({
  className = "",
  helpText,
  buttons,
}: CommonFooterProps) {
  const getIcon = (type: "docs" | "support") => {
    switch (type) {
      case "docs":
        return BookOpen;
      case "support":
        return HelpCircle;
      default:
        return BookOpen;
    }
  };

  return (
    <footer
      className={`fixed ml-64 bottom-0 left-0 right-0 border-t border-gray-200 bg-white py-4 shadow-sm z-content ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">{helpText}</div>
          <div className="flex items-center gap-4">
            {buttons.map((button, index) => {
              const Icon = getIcon(button.type);
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                  leftIcon={<Icon size={16} />}
                  onClick={() => window.open(button.link, "_blank")}
                >
                  {button.text}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default CommonFooter;
