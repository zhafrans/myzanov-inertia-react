import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableRow, TableCell } from "@/components/ui/table"

export default function TopSubdistrict({ data }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Subdistrict</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {data.map((item, i) => (
                            <TableRow key={i}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell className="text-right">
                                    {item.total}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
