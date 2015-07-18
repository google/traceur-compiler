// Options: --jsx=f
// Error: :8:6: Non matching JSX closing tag. Expected a, found aa
// Error: :9:8: Non matching JSX closing tag. Expected b.b, found b
// Error: :10:6: Non matching JSX closing tag. Expected c, found c.c
// Error: :11:14: Non matching JSX closing tag. Expected dd, found dddd
// Error: :12:10: Non matching JSX closing tag. Expected f, found ff

<a></aa>;
<b.b></b>;
<c></c.c>;
<dd><e></e></dddd>;
<f><g/></ff>;
