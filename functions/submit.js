export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        
        // Parse form data
        const formData = await request.formData();
        const number = formData.get('number');
        const captchaToken = formData.get('g-recaptcha-response');

        // Validate required fields
        if (!number || !captchaToken) {
            return new Response(JSON.stringify({
                result: "FAIL",
                reason: "Missing required fields"
            }), { status: 400 });
        }

        // Verify reCAPTCHA with Google
        const verifyUrl = new URL('https://www.google.com/recaptcha/api/siteverify');
        verifyUrl.searchParams.set('secret', env.RECAPTCHA_SECRET);
        verifyUrl.searchParams.set('response', captchaToken);
        
        const verification = await fetch(verifyUrl);
        const { success } = await verification.json();

        if (!success) {
            return new Response(JSON.stringify({
                result: "FAIL",
                reason: "reCAPTCHA verification failed"
            }), { status: 403 });
        }

        // Return successful response
        return new Response(JSON.stringify({
            result: "OK",
            number: parseInt(number)
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            result: "FAIL",
            reason: "Server error"
        }), { status: 500 });
    }
}
