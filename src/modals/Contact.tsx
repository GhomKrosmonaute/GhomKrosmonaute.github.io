import { useModal } from "../hooks/useModal.ts";
import { Card } from "../components/Card.tsx";

export const Contact = () => {
  const { setModal } = useModal();

  return (
    <Card onClose={() => setModal(false)}>
      <h1>Contact</h1>
    </Card>
  );
};
