import { useModal } from "../hooks/useModal.ts";
import { Card } from "../components/Card.tsx";

import Email from "@/assets/icons/social/email.svg";
import LinkedIn from "@/assets/icons/social/linkedin.svg";

export const Contact = () => {
  const { setModal } = useModal();

  return (
    <Card onClose={() => setModal(false)}>
      <div className="space-y-4">
        <h1 className="text-3xl">Contact</h1>
        <div className="flex flex-col gap-2">
          <a href="mailto: camille.abella@proton.me" target="_blank">
            <code className="flex items-center gap-4 h-min">
              {/* @ts-expect-error It's OK */}
              <Email className="w-5" />
              camille.abella@proton.me
            </code>
          </a>
          <a
            href="https://www.linkedin.com/in/camille-abella-a99950176/"
            target="_blank"
          >
            <code className="flex items-center gap-4">
              {/* @ts-expect-error It's OK */}
              <LinkedIn className="w-5" />
              LinkedIn: Camille ABELLA
            </code>
          </a>
        </div>
      </div>
    </Card>
  );
};
