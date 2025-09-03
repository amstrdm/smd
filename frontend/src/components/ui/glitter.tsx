// src/components/Glitter.tsx
const Glitter = () => {
  const particles = Array.from({ length: 30 }); // Generate 30 glitter particles

  return (
    <div className="glitter-container">
      {particles.map((_, i) => (
        <div
          key={i}
          className="glitter-particle"
          style={{
            // Randomize position, delay, and duration for a natural effect
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Glitter;
