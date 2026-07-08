export const metadata = {
  title: "Client Portal",
  description: "Reports and deliverables, in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#F5F7FB",
          minHeight: "100vh",
        }}
      >
        {children}
      </body>
    </html>
  );
}
