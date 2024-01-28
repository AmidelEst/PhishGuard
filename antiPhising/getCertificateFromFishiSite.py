import ssl
import socket
from OpenSSL import crypto
from datetime import datetime

def asn1_to_datetime(asn1_time):
    # Convert ASN.1 time to datetime
    return datetime.strptime(asn1_time.decode(), "%Y%m%d%H%M%SZ")

def get_certificate_and_public_key(url):
    try:
        # Extract the host from the URL
        host = url.split("://")[1].split("/")[0]

        # Establish a connection to the server
        context = ssl.create_default_context()
        with socket.create_connection((host, 443)) as sock:
            with context.wrap_socket(sock, server_hostname=host) as ssock:
                # Retrieve the SSL/TLS certificate
                cert_data = ssock.getpeercert(True)

                # Load the certificate
                x509 = crypto.load_certificate(crypto.FILETYPE_ASN1, cert_data)

                # Extract certificate details
                domain = host
                subject = dict(x509.get_subject().get_components())
                issuer = dict(x509.get_issuer().get_components())
                serial_number = x509.get_serial_number()
                version = x509.get_version()
                not_before = asn1_to_datetime(x509.get_notBefore())
                not_after = asn1_to_datetime(x509.get_notAfter())
                signature_algorithm = x509.get_signature_algorithm().decode()

                # Get the public key
                pubkey = x509.get_pubkey()

                # Format the certificate and public key as PEM-encoded strings
                certificate_str = f"Domain: {domain}\n" \
                                  f"Subject: {subject}\n" \
                                  f"Issuer: {issuer}\n" \
                                  f"Serial Number: {serial_number}\n" \
                                  f"Version: {version}\n" \
                                  f"Not Before: {not_before}\n" \
                                  f"Not After: {not_after}\n" \
                                  f"Signature Algorithm: {signature_algorithm}\n" \
                                  f"Public Key: {crypto.dump_publickey(crypto.FILETYPE_PEM, pubkey).decode()}"

                # Save the certificate to a file
                with open("certificate.txt", "w") as cert_file:
                    cert_file.write(certificate_str)

                return "Certificate saved to certificate.txt"
    except Exception as e:
        return f"Error: {e}"

if __name__ == "__main__":
    website_url = "https://chat.openai.com/c/42da134a-2edb-4e72-8222-ef5b3e4a7f28"
    result = get_certificate_and_public_key(website_url)

    print(result)
