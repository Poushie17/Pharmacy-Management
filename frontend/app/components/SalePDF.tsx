
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
  },

  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    paddingBottom: 10,
    marginBottom: 15,
  },

  logo: {
    width: 70,
    height: 45,
  },

  headerText: {
    marginLeft: 12,
  },

  title: {
    fontSize: 18,
    color: "#10B981",
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 9,
    color: "#666",
    marginTop: 2,
  },

  receiptTitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },

  info: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    marginBottom: 4,
  },

  label: {
    width: 80,
    fontSize: 9,
    color: "#666",
  },

  value: {
    fontSize: 9,
    fontWeight: "bold",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#10B981",
    padding: 6,
  },

  th: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
  },

  tr: {
    flexDirection: "row",
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    fontSize: 9,
  },

  col1: { width: "40%" },
  col2: { width: "15%", textAlign: "center" },
  col3: { width: "20%", textAlign: "right" },
  col4: { width: "25%", textAlign: "right" },

  totals: {
    marginTop: 15,
    alignItems: "flex-end",
  },

  totalRow: {
    flexDirection: "row",
    marginBottom: 4,
  },

  totalLabel: {
    width: 90,
    fontSize: 10,
    textAlign: "right",
  },

  totalValue: {
    width: 80,
    fontSize: 10,
    textAlign: "right",
  },

  grand: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#10B981",
  },

  footer: {
    marginTop: 30,
    textAlign: "center",
  },

  footerText: {
    fontSize: 8,
    color: "#888",
    marginBottom: 2,
  },
});

interface Sale {
  id: number;
  date: string;
  medicine_name: string;
  quantity: number;
  total: number;
  profit: number;
}

export const SalePDF = ({ sale }: { sale: Sale }) => {
  const unitPrice = sale.total / sale.quantity;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
         <Image
           style={styles.logo}
           src="http://localhost:3000/logo.png"
         />
          <View style={styles.headerText}>
            <Text style={styles.title}>PHARMAC+</Text>
            <Text style={styles.subtitle}>
              123 Healthcare Street, Medical District
            </Text>
            <Text style={styles.subtitle}>
              +880 1234 567890 | info@pharmacplus.com
            </Text>
          </View>
        </View>

        <Text style={styles.receiptTitle}>SALES RECEIPT</Text>

        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice:</Text>
            <Text style={styles.value}>
              INV-{sale.id.toString().padStart(6, "0")}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{sale.date}</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={[styles.th, styles.col1]}>Medicine</Text>
          <Text style={[styles.th, styles.col2]}>Qty</Text>
          <Text style={[styles.th, styles.col3]}>Unit</Text>
          <Text style={[styles.th, styles.col4]}>Total</Text>
        </View>

        <View style={styles.tr}>
          <Text style={styles.col1}>{sale.medicine_name}</Text>
          <Text style={styles.col2}>{sale.quantity}</Text>
          <Text style={styles.col3}>BDT {unitPrice.toFixed(2)}</Text>
          <Text style={styles.col4}>BDT {sale.total.toFixed(2)}</Text>
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>BDT {sale.total.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Profit:</Text>
            <Text style={styles.totalValue}>BDT {(sale.profit || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grand]}>TOTAL:</Text>
            <Text style={[styles.totalValue, styles.grand]}>
              BDT {sale.total.toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for choosing PHARMAC+
          </Text>
          <Text style={styles.footerText}>
            This is a system generated receipt
          </Text>
        </View>
      </Page>
    </Document>
  );
};