const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EarlyAccessRequest = {
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as EarlyAccessRequest;
  const email = body.email?.trim().toLowerCase();

  if (!email || !EMAIL_REGEX.test(email)) {
    return Response.json(
      {
        success: false,
        message: "Enter a valid email address to join the waitlist.",
      },
      { status: 400 },
    );
  }

  return Response.json({
    success: true,
    message: `Thanks, ${email} is on the early access list.`,
  });
}
