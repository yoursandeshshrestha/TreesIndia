import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store";
import { open } from "@/app/store/slices/commandPalette/commandPalette.slice";

export const useGlobalCommandPalette = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.commandPalette.isOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Command+K (Mac) or Ctrl+K (Windows/Linux) is pressed
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        // Only open if not already open
        if (!isOpen) {
          dispatch(open());
        }
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
};
