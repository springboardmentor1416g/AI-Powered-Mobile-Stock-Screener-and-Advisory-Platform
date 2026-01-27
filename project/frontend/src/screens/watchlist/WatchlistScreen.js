import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { postJson } from "../../services/http";

const WatchlistTab = ({ item, isActive, onSelect, onDelete }) => (
  <TouchableOpacity
    style={[styles.tab, isActive && styles.activeTab]}
    onPress={onSelect}
  >
    <Text style={[styles.tabText, isActive && styles.activeTabText]}>
      ⭐ {item.name}
    </Text>
    <TouchableOpacity onPress={onDelete}>
      <Text style={[styles.tabDeleteText, isActive && styles.activeTabDeleteText]}>✕</Text>
    </TouchableOpacity>
  </TouchableOpacity>
);

const StockCard = ({ item, onRemove }) => (
  <View style={styles.stockCard}>
    <View style={styles.stockHeader}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockTicker}>{item.ticker}</Text>
        <Text style={styles.stockName}>{item.company_name}</Text>
      </View>
      <View style={styles.priceSection}>
        <Text style={styles.price}>${(item.current_price || 0).toFixed(2)}</Text>
        <Text
          style={[
            styles.change,
            {
              color: (item.price_change || 0) >= 0 ? "#10b981" : "#ef4444",
            },
          ]}
        >
          {(item.price_change || 0) >= 0 ? "↑" : "↓"}{" "}
          {Math.abs(item.price_change || 0).toFixed(2)}%
        </Text>
      </View>
    </View>
    {item.notes && <Text style={styles.notes}>📝 {item.notes}</Text>}
    <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
      <Text style={styles.removeBtnIcon}>🗑️</Text>
    </TouchableOpacity>
  </View>
);

export default function WatchlistScreen() {
  const { user } = useContext(AuthContext);
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [watchlistItems, setWatchlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWatchlists();
  }, []);

  async function loadWatchlists() {
    try {
      setLoading(true);
      const response = await postJson("/api/v1/watchlist", {
        action: "list",
      });

      if (response.success) {
        setWatchlists(response.watchlists || []);
        if (response.watchlists && response.watchlists.length > 0) {
          selectWatchlist(response.watchlists[0]);
        }
      } else {
        setError(response.error || "Failed to load watchlists");
      }
    } catch (e) {
      setError(e.message || "Error loading watchlists");
    } finally {
      setLoading(false);
    }
  }

  async function selectWatchlist(watchlist) {
    try {
      setSelectedWatchlist(watchlist);
      const response = await postJson("/api/v1/watchlist/items", {
        action: "list",
        watchlistId: watchlist.id,
      });

      if (response.success) {
        setWatchlistItems(response.items || []);
      }
    } catch (e) {
      setError(e.message || "Error loading watchlist items");
    }
  }

  async function handleCreateWatchlist() {
    if (!newWatchlistName.trim()) {
      setError("Watchlist name is required");
      return;
    }

    try {
      const response = await postJson("/api/v1/watchlist", {
        action: "create",
        name: newWatchlistName,
      });

      if (response.success) {
        setNewWatchlistName("");
        setShowCreateModal(false);
        await loadWatchlists();
      } else {
        setError(response.error || "Failed to create watchlist");
      }
    } catch (e) {
      setError(e.message || "Error creating watchlist");
    }
  }

  async function handleSearchStocks(query) {
    setStockSearch(query);
    if (query.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await postJson("/api/v1/market/search", {
        query,
        limit: 5,
      });

      if (response.success) {
        setSearchResults(response.results || []);
      }
    } catch (e) {
      console.error("Error searching stocks:", e);
    }
  }

  async function handleAddStock(ticker) {
    if (!selectedWatchlist) return;

    try {
      const response = await postJson("/api/v1/watchlist/items", {
        action: "add",
        watchlistId: selectedWatchlist.id,
        ticker,
      });

      if (response.success) {
        setStockSearch("");
        setSearchResults([]);
        setShowAddStockModal(false);
        await selectWatchlist(selectedWatchlist);
      } else {
        setError(response.error || "Failed to add stock");
      }
    } catch (e) {
      setError(e.message || "Error adding stock");
    }
  }

  async function handleRemoveStock(itemId) {
    if (!selectedWatchlist) return;

    try {
      const response = await postJson("/api/v1/watchlist/items", {
        action: "remove",
        watchlistId: selectedWatchlist.id,
        itemId,
      });

      if (response.success) {
        await selectWatchlist(selectedWatchlist);
      } else {
        setError(response.error || "Failed to remove stock");
      }
    } catch (e) {
      setError(e.message || "Error removing stock");
    }
  }

  async function handleDeleteWatchlist(watchlistId) {
    try {
      const response = await postJson("/api/v1/watchlist", {
        action: "delete",
        watchlistId,
      });

      if (response.success) {
        if (selectedWatchlist?.id === watchlistId) {
          setSelectedWatchlist(null);
          setWatchlistItems([]);
        }
        await loadWatchlists();
      } else {
        setError(response.error || "Failed to delete watchlist");
      }
    } catch (e) {
      setError(e.message || "Error deleting watchlist");
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ec4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Text style={styles.iconText}>⭐</Text>
          </View>
          <View>
            <Text style={styles.title}>Watchlists</Text>
            <Text style={styles.subtitle}>Track your favorite stocks</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            setError("");
            setShowCreateModal(true);
          }}
        >
          <Text style={styles.createButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {watchlists.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyText}>No watchlists yet</Text>
          <Text style={styles.emptySubtext}>Create a watchlist to track your favorite stocks</Text>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {watchlists.map((wl) => (
              <WatchlistTab
                key={wl.id}
                item={wl}
                isActive={selectedWatchlist?.id === wl.id}
                onSelect={() => selectWatchlist(wl)}
                onDelete={() => handleDeleteWatchlist(wl.id)}
              />
            ))}
          </ScrollView>

          {/* Add Stock Button */}
          {selectedWatchlist && (
            <TouchableOpacity
              style={styles.addStockButton}
              onPress={() => {
                setError("");
                setStockSearch("");
                setSearchResults([]);
                setShowAddStockModal(true);
              }}
            >
              <Text style={styles.addStockIcon}>+</Text>
              <Text style={styles.addStockButtonText}>Add Stock</Text>
            </TouchableOpacity>
          )}

          {/* Stocks List */}
          {selectedWatchlist && (
            <>
              {watchlistItems.length === 0 ? (
                <View style={styles.emptyList}>
                  <Text style={styles.emptyListIcon}>📭</Text>
                  <Text style={styles.emptyListText}>No stocks in this watchlist</Text>
                </View>
              ) : (
                <FlatList
                  data={watchlistItems}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <StockCard
                      item={item}
                      onRemove={() => handleRemoveStock(item.id)}
                    />
                  )}
                  contentContainerStyle={styles.listContent}
                  scrollIndicatorInsets={{ right: 1 }}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Create Watchlist Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Watchlist</Text>

            <TextInput
              style={styles.input}
              placeholder="Watchlist Name"
              placeholderTextColor="#999"
              value={newWatchlistName}
              onChangeText={setNewWatchlistName}
            />

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleCreateWatchlist}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Stock Modal */}
      <Modal visible={showAddStockModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Stock to {selectedWatchlist?.name}</Text>

            <View style={styles.searchInputWrapper}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by ticker (e.g., AAPL)"
                placeholderTextColor="#999"
                value={stockSearch}
                onChangeText={handleSearchStocks}
              />
            </View>

            {searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.ticker}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResult}
                    onPress={() => handleAddStock(item.ticker)}
                  >
                    <View>
                      <Text style={styles.resultTicker}>{item.ticker}</Text>
                      <Text style={styles.resultName}>{item.name}</Text>
                    </View>
                    <Text style={styles.resultPrice}>${item.price}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { marginTop: 20 }]}
              onPress={() => setShowAddStockModal(false)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#ec4899",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ec4899",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  iconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
  },
  subtitle: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginTop: 2,
  },
  createButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#ec4899",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 13,
  },
  errorBox: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    fontSize: 13,
    color: "#991b1b",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    fontWeight: "500",
  },
  tabsContainer: {
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tabsContent: {
    gap: 8,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#ec4899",
    borderColor: "#ec4899",
  },
  tabText: {
    color: "#666",
    fontWeight: "700",
    fontSize: 13,
  },
  activeTabText: {
    color: "white",
  },
  tabDeleteText: {
    color: "#999",
    fontSize: 14,
  },
  activeTabDeleteText: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  addStockButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ec4899",
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    shadowColor: "#ec4899",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  addStockIcon: {
    fontSize: 18,
    color: "white",
    fontWeight: "800",
  },
  addStockButtonText: {
    color: "white",
    fontWeight: "800",
    fontSize: 14,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyListIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyListText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
  },
  stockCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  stockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stockInfo: {
    flex: 1,
  },
  stockTicker: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
  },
  stockName: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  priceSection: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111",
  },
  change: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  notes: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    fontStyle: "italic",
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
  },
  removeBtnIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    color: "#111",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
    fontWeight: "500",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "500",
  },
  searchResult: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  resultTicker: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  resultName: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  modalButtonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    fontWeight: "800",
    color: "#111",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#ec4899",
  },
  confirmButtonText: {
    fontWeight: "800",
    color: "white",
    fontSize: 14,
  },
});

