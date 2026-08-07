<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Message Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Email container -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03); border: 1px solid #e5e7eb; overflow: hidden;">
                    
                    <!-- Header Section -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 32px; text-align: center;">
                            <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Portfolio CMS</h2>
                            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">New Contact Inquiry Received</p>
                        </td>
                    </tr>

                    <!-- Content Section -->
                    <tr>
                        <td style="padding: 32px;">
                            <p style="margin: 0 0 20px 0; color: #334155; font-size: 16px; line-height: 1.5; font-weight: 500;">
                                Hello, you have received a new message through the contact form on your portfolio website.
                            </p>

                            <!-- Metadata Table -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                                <tr>
                                    <td width="30%" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #64748b; font-weight: 600; vertical-align: top;">Name</td>
                                    <td width="70%" style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 500; vertical-align: top;">{{ $name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #64748b; font-weight: 600; vertical-align: top;">Email</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #2563eb; font-weight: 500; vertical-align: top;">
                                        <a href="mailto:{{ $email }}" style="color: #2563eb; text-decoration: none;">{{ $email }}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #64748b; font-weight: 600; vertical-align: top;">Subject</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 500; vertical-align: top; font-style: italic;">{{ $subject }}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #64748b; font-weight: 600; vertical-align: top;">Date & Time</td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; font-weight: 500; vertical-align: top;">{{ now()->timezone('Asia/Kolkata')->format('M d, Y - h:i A') }} (IST)</td>
                                </tr>
                            </table>

                            <!-- Message Box -->
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Message Body</p>
                                <p style="margin: 0; font-size: 15px; color: #334155; line-height: 1.6; white-space: pre-line;">{!! e($contact_message) !!}</p>
                            </div>

                            <!-- Reply Action Button -->
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <a href="mailto:{{ $email }}?subject=RE: {{ rawurlencode($subject) }}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2); transition: background-color 0.2s ease;">
                                            Reply directly to {{ explode(' ', trim($name))[0] }}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer Section -->
                    <tr>
                        <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #f1f5f9;">
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">This is an automated message sent from your Portfolio CMS.</p>
                            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">&copy; {{ date('Y') }} Saurabh Sharma. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
