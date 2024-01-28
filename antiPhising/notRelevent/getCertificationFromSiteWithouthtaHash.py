import ssl
import socket
from datetime import datetime
from OpenSSL import crypto

def get_certificate_info(domain, port=443):
    try:
        context = ssl.create_default_context()
        with context.wrap_socket(socket.create_connection((domain, port)), server_hostname=domain) as ssl_socket:
            # Fetch the SSL/TLS certificate
            der_cert = ssl_socket.getpeercert(True)

            # Load the certificate using OpenSSL.crypto
            try:
                x509 = crypto.load_certificate(crypto.FILETYPE_ASN1, der_cert)
            except crypto.Error as cert_error:
                return f"Error loading certificate: {cert_error}"

            # Extract certificate information
            certificate_info = {
                'Subject': dict(x509.get_subject().get_components()),
                'Issuer': dict(x509.get_issuer().get_components()),
                'Serial Number': x509.get_serial_number(),
                'Version': x509.get_version(),
                'Not Before': datetime.strptime(x509.get_notBefore().decode(), '%Y%m%d%H%M%SZ'),
                'Not After': datetime.strptime(x509.get_notAfter().decode(), '%Y%m%d%H%M%SZ'),
                'Signature Algorithm': x509.get_signature_algorithm(),
                'Public Key': crypto.dump_publickey(crypto.FILETYPE_PEM, x509.get_pubkey()).decode(),
            }

            return certificate_info

    except Exception as e:
        return f"Error: {e}"

# Example usage
domain_name = input("Enter the domain name (e.g., www.example.com): ")
certificate_info = get_certificate_info(domain_name)

if isinstance(certificate_info, dict):
    print("SSL/TLS Certificate Information:")
    for key, value in certificate_info.items():
        print(f"{key}: {value}")
else:
    print(certificate_info)
